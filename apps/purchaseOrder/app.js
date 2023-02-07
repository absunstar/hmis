module.exports = function init(site) {
    let app = {
        name: 'purchaseOrder',
        allowMemory: false,
        memoryList: [],
        allowCache: false,
        cacheList: [],
        allowRoute: true,
        allowRouteGet: true,
        allowRouteAdd: true,
        allowRouteUpdate: true,
        allowRouteDelete: true,
        allowRouteView: true,
        allowRouteAll: true,
    };

    app.$collection = site.connectCollection(app.name);

    app.init = function () {
        if (app.allowMemory) {
            app.$collection.findMany({}, (err, docs) => {
                if (!err) {
                    if (docs.length == 0) {
                        app.cacheList.forEach((_item, i) => {
                            app.$collection.add(_item, (err, doc) => {
                                if (!err && doc) {
                                    app.memoryList.push(doc);
                                }
                            });
                        });
                    } else {
                        docs.forEach((doc) => {
                            app.memoryList.push(doc);
                        });
                    }
                }
            });
        }
    };
    app.add = function (_item, callback) {
        app.$collection.add(_item, (err, doc) => {
            if (callback) {
                callback(err, doc);
            }
            if (app.allowMemory && !err && doc) {
                app.memoryList.push(doc);
            }
        });
    };
    app.update = function (_item, callback) {
        app.$collection.edit(
            {
                where: {
                    id: _item.id,
                },
                set: _item,
            },
            (err, result) => {
                if (callback) {
                    callback(err, result);
                }
                if (app.allowMemory && !err && result) {
                    let index = app.memoryList.findIndex((itm) => itm.id === result.doc.id);
                    if (index !== -1) {
                        app.memoryList[index] = result.doc;
                    } else {
                        app.memoryList.push(result.doc);
                    }
                } else if (app.allowCache && !err && result) {
                    let index = app.cacheList.findIndex((itm) => itm.id === result.doc.id);
                    if (index !== -1) {
                        app.cacheList[index] = result.doc;
                    } else {
                        app.cacheList.push(result.doc);
                    }
                }
            }
        );
    };
    app.delete = function (_item, callback) {
        app.$collection.delete(
            {
                id: _item.id,
            },
            (err, result) => {
                if (callback) {
                    callback(err, result);
                }
                if (app.allowMemory && !err && result.count === 1) {
                    let index = app.memoryList.findIndex((a) => a.id === _item.id);
                    if (index !== -1) {
                        app.memoryList.splice(index, 1);
                    }
                } else if (app.allowCache && !err && result.count === 1) {
                    let index = app.cacheList.findIndex((a) => a.id === _item.id);
                    if (index !== -1) {
                        app.cacheList.splice(index, 1);
                    }
                }
            }
        );
    };
    app.view = function (_item, callback) {
        if (callback) {
            if (app.allowMemory) {
                if ((item = app.memoryList.find((itm) => itm.id == _item.id))) {
                    callback(null, item);
                    return;
                }
            } else if (app.allowCache) {
                if ((item = app.cacheList.find((itm) => itm.id == _item.id))) {
                    callback(null, item);
                    return;
                }
            }

            app.$collection.find({ id: _item.id }, (err, doc) => {
                callback(err, doc);

                if (!err && doc) {
                    if (app.allowMemory) {
                        app.memoryList.push(doc);
                    } else if (app.allowCache) {
                        app.cacheList.push(doc);
                    }
                }
            });
        }
    };
    app.all = function (_options, callback) {
        if (callback) {
            if (app.allowMemory) {
                callback(null, app.memoryList);
            } else {
                app.$collection.findMany(_options, callback);
            }
        }
    };

    if (app.allowRoute) {
        if (app.allowRouteGet) {
            site.get({
                name: '/',
                path: __dirname + '/site_files/',
            });

            site.get(
                {
                    name: app.name,
                },
                (req, res) => {
                    res.render(app.name + '/index.html', { title: app.name }, { parser: 'html', compres: true });
                }
            );
        }

        if (app.allowRouteAdd) {
            site.post({ name: `/api/${app.name}/add`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;
                _data.company = site.getCompany(req);

                let numObj = {
                    company: site.getCompany(req),
                    screen: app.name,
                    date: new Date(),
                };

                let cb = site.getNumbering(numObj);
                if (!_data.code && !cb.auto) {
                    response.error = 'Must Enter Code';
                    res.json(response);
                    return;
                } else if (cb.auto) {
                    _data.code = cb.code;
                }

                app.$collection.find({ code: _data.code }, (err, doc) => {
                    if (doc) {
                        response.done = false;
                        response.error = 'There Is Order Exisit With Same Code';
                        return res.json(response);
                    }
                    _data.addUserInfo = req.getUserFinger();

                    app.add(_data, (err, doc) => {
                        if (!err && doc) {
                            response.done = true;
                            response.doc = doc;
                        } else {
                            response.error = err.mesage;
                        }

                        if (_data.source.id === 1 && _data.purchaseRequest && _data.purchaseRequest.id) {
                            const purchaseRequestApp = site.getApp('purchaseRequest');
                            purchaseRequestApp.$collection.update({ where: { id: _data.purchaseRequest.id }, set: { hasTransaction: true } });
                            res.json(response);
                        }
                    });
                });
            });
        }

        if (app.allowRouteUpdate) {
            site.post({ name: `/api/${app.name}/update`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;
                app.$collection.find({ code: _data.code, id: { $ne: _data.id } }, (err, doc) => {
                    if (doc) {
                        response.done = false;
                        response.error = 'There Is Order Exisit With Same Code';
                        res.json(response);
                        return;
                    }
                    _data.editUserInfo = req.getUserFinger();

                    app.update(_data, (err, result) => {
                        if (!err) {
                            response.done = true;
                            response.result = result;
                        } else {
                            response.error = err.message;
                        }
                        res.json(response);
                    });
                });
            });
        }

        if (app.allowRouteUpdate) {
            site.post({ name: `/api/${app.name}/approve`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;
                _data.approveUserInfo = req.getUserFinger();

                app.update(_data, (err, result) => {
                    if (!err) {
                        response.done = true;
                        response.result = result;
                    } else {
                        response.error = err.message;
                    }
                    const storesItemsApp = site.getApp('storesItems');
                    _data.itemsList.forEach((itm) => {
                        // if (_data.calculatePurchaseCost) {
                        //     if (_data.calculatePurchaseCostType === 'items') {
                        //         const itemsCount = _data.itemsList.length;
                        //         const itemPurchaseCost = _data.purchaseCost / itemsCount;
                        //         for (const item of _data.itemsList) {
                        //             const itemPurchasePriceCost = itemPurchaseCost / item.purchaseCount;
                        //             item.purchaseCost = itemPurchasePriceCost;
                        //         }
                        //     }
                        // }
                        // const purchasePrice = itm.purchasePrice / itm.purchaseCount;

                        storesItemsApp.$collection.find({ where: { id: itm.item.id } }, (err, doc) => {
                            let index = doc.unitsList.findIndex((unt) => unt.unit.id === itm.unit.id);

                            if (index !== -1) {
                                let storeIndex = doc.unitsList[index].storesList.findIndex((s) => s.store.id === _data.store.id);
                                if (storeIndex === -1) {
                                    doc.unitsList[index].storesList.push({
                                        store: _data.store,
                                        purchaseCost: itm.purchaseCost || 0,
                                        purchaseCount: itm.purchaseCount,
                                        purchasePrice: itm.purchasePrice,
                                        purchaseReturnCount: 0,
                                        purchaseReturnPrice: 0,
                                        salesCount: 0,
                                        salesPrice: 0,
                                        salesReturnCount: 0,
                                        salesReturnPrice: 0,
                                        bonusCount: itm.bonusCount,
                                        bonusPrice: itm.bonusPrice,
                                        bonusPrice: 0,
                                        damagedCount: 0,
                                        damagedPrice: 0,
                                        assembledCount: 0,
                                        assembledPrice: 0,
                                        unassembledCount: 0,
                                        unassembledPrice: 0,
                                    });
                                } else {
                                    doc.unitsList[index].storesList[storeIndex].purchaseCount += itm.purchaseCount;
                                    doc.unitsList[index].storesList[storeIndex].purchaseCost += itm.purchaseCost;
                                    doc.unitsList[index].storesList[storeIndex].purchasePrice += itm.purchasePrice;
                                    doc.unitsList[index].storesList[storeIndex].bonusCount += itm.bonusCount;
                                    doc.unitsList[index].storesList[storeIndex].bonusPrice += itm.bonusPrice;
                                }
                            }

                            const storesItemsCardApp = site.getApp('storesItemsCard');
                            const transactionType = site.storesTransactionsTypes.find((t) => t.id === 1);
                            const purchaseItem = { id: itm.item.id, code: itm.item.code, nameAr: itm.item.nameAr, nameEn: itm.item.nameEn };
                            const purchaseUnit = { id: itm.unit.id, code: itm.unit.code, nameAr: itm.unit.nameAr, nameEn: itm.unit.nameEn };
                            storesItemsCardApp.$collection.findMany({ where: { 'transactionType.id': transactionType.id, 'item.id': itm.item.id, 'unit.id': itm.unit.id } }, (err, docs) => {
                                if (docs.length) {
                                    const lastDoc = docs[docs.length - 1];

                                    storesItemsCardApp.$collection.add({
                                        transactionType: site.storesTransactionsTypes.find((t) => t.id === 1),
                                        date: _data.orderDate,
                                        item: purchaseItem,
                                        unit: purchaseUnit,
                                        itemGroup: doc.itemGroup,
                                        store: _data.store,
                                        vendor: _data.vendor,
                                        invoice_id: _data.id,
                                        count: lastDoc.count + itm.purchaseCount,
                                        price: lastDoc.price + itm.purchasePrice,
                                    });
                                } else {
                                    storesItemsCardApp.$collection.add({
                                        transactionType: site.storesTransactionsTypes.find((t) => t.id === 1),
                                        date: _data.orderDate,
                                        item: purchaseItem,
                                        unit: purchaseUnit,
                                        itemGroup: doc.itemGroup,
                                        store: _data.store,
                                        vendor: _data.vendor,
                                        invoice_id: _data.id,
                                        count: itm.purchaseCount,
                                        price: itm.purchasePrice,
                                    });
                                }
                            });
                            storesItemsApp.$collection.update(doc);
                        });
                    });

                    res.json(response);
                });
            });
        }

        if (app.allowRouteDelete) {
            site.post({ name: `/api/${app.name}/delete`, require: { permissions: ['login'] } }, (req, res) => {
                let response = {
                    done: false,
                };
                let _data = req.data;

                app.delete(_data, (err, result) => {
                    if (!err && result.count === 1) {
                        response.done = true;
                        response.result = result;
                    } else {
                        response.error = err?.message || 'Deleted Not Exists';
                    }
                    res.json(response);
                });
            });
        }

        if (app.allowRouteView) {
            site.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
                let response = {
                    done: false,
                };

                let _data = req.data;
                app.view(_data, (err, doc) => {
                    if (!err && doc) {
                        response.done = true;
                        response.doc = doc;
                    } else {
                        response.error = err?.message || 'Not Exists';
                    }
                    res.json(response);
                });
            });
        }

        if (app.allowRouteAll) {
            site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
                let where = req.body.where || {};
                let select = req.body.select || { id: 1, code: 1, nameEn: 1, nameAr: 1, image: 1 };
                let list = [];
                if (app.allowMemory) {
                    app.memoryList
                        .filter((g) => g.company && g.company.id == site.getCompany(req).id)
                        .forEach((doc) => {
                            let obj = { ...doc };

                            for (const p in obj) {
                                if (!Object.hasOwnProperty.call(select, p)) {
                                    delete obj[p];
                                }
                            }
                            if (!where.active || doc.active) {
                                list.push(obj);
                            }
                        });
                    res.json({
                        done: true,
                        list: list,
                    });
                } else {
                    app.$collection.findMany({ where: where, select }, (err, docs) => {
                        res.json({
                            done: true,
                            list: docs,
                        });
                    });
                }
            });
        }
    }

    app.init();
    site.addApp(app);
};
