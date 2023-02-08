module.exports = function init(site) {
    let app = {
        name: 'salesInvoices',
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
                    res.render(app.name + '/index.html', { title: app.name, appName: 'Sales Invoices' }, { parser: 'html', compres: true });
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

                _data.addUserInfo = req.getUserFinger();

                const storesItemsApp = site.getApp('storesItems');
                const systemSetting = site.getSystemSetting(req);

                _data.itemsList.forEach((itm) => {
                    storesItemsApp.$collection.find({ where: { id: itm.item.id } }, (err, itemDoc) => {
                        let index = itemDoc.unitsList.findIndex((unt) => unt.unit.id === itm.unit.id);

                        if (index === -1) {
                            response.error = 'Item Unit Not Exisit';
                            response.done = false;
                            res.json(response);
                            return;
                        } else {
                            // const caluclatedItemBalance = site.calculateStroeItemBalance(itemDoc);
                            let storeIndex = itemDoc.unitsList[index].storesList.findIndex((s) => s.store.id === _data.store.id);
                            const totalIncome =
                                itemDoc.unitsList[index].storesList[storeIndex].purchaseCount +
                                itemDoc.unitsList[index].storesList[storeIndex].bonusCount +
                                itemDoc.unitsList[index].storesList[storeIndex].unassembledCount +
                                itemDoc.unitsList[index].storesList[storeIndex].salesReturnCount;

                            const totalOut =
                                itemDoc.unitsList[index].storesList[storeIndex].salesCount +
                                itemDoc.unitsList[index].storesList[storeIndex].purchaseReturnCount +
                                itemDoc.unitsList[index].storesList[storeIndex].damagedCount +
                                itemDoc.unitsList[index].storesList[storeIndex].assembledCount;

                            const avaliableBalanceForSale = totalIncome - totalOut;

                            if ((!systemSetting.storesSetting.allowOverdraft && avaliableBalanceForSale > itm.salesCount) || avaliableBalanceForSale > itm.salesCount) {
                                app.add(_data, (err, doc) => {
                                    if (!err && doc) {
                                        response.done = true;
                                        response.doc = doc;
                                        itemDoc.unitsList[index].storesList[storeIndex].salesCount += itm.salesCount;
                                        itemDoc.unitsList[index].storesList[storeIndex].salesPrice += itm.salesPrice * itm.salesCount;
                                        const storesItemsCardApp = site.getApp('storesItemsCard');
                                        storesItemsApp.$collection.update(itemDoc);
                                        const transactionType = site.storesTransactionsTypes.find((t) => t.id === 2);
                                        const salesItem = { id: itm.item.id, code: itm.item.code, nameAr: itm.item.nameAr, nameEn: itm.item.nameEn };
                                        const salesUnit = { id: itm.unit.id, code: itm.unit.code, nameAr: itm.unit.nameAr, nameEn: itm.unit.nameEn };
                                        storesItemsCardApp.$collection.findMany(
                                            { where: { 'transactionType.id': transactionType.id, 'item.id': itm.item.id, 'unit.id': itm.unit.id } },
                                            (err, docs) => {
                                                if (docs.length) {
                                                    const lastDoc = docs[docs.length - 1];

                                                    storesItemsCardApp.$collection.add({
                                                        transactionType: site.storesTransactionsTypes.find((t) => t.id === 2),
                                                        date: _data.date,
                                                        item: salesItem,
                                                        unit: salesUnit,
                                                        itemGroup: itemDoc.itemGroup,
                                                        store: _data.store,
                                                        customer: _data.customer,
                                                        invoice_id: doc.id,
                                                        count: lastDoc.count + itm.salesCount,
                                                        price: lastDoc.price + itm.salesPrice * itm.salesCount,
                                                    });
                                                } else {
                                                    storesItemsCardApp.$collection.add({
                                                        transactionType: site.storesTransactionsTypes.find((t) => t.id === 2),
                                                        date: _data.date,
                                                        item: salesItem,
                                                        unit: salesUnit,
                                                        itemGroup: itemDoc.itemGroup,
                                                        store: _data.store,
                                                        customer: _data.customer,
                                                        invoice_id: doc.id,
                                                        count: itm.salesCount,
                                                        price: itm.salesPrice * itm.salesCount,
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        response.error = err.mesage;
                                    }
                                    res.json(response);
                                });
                            } else {
                                response.error = 'Item Balance Not Allowed';
                                response.done = false;
                                res.json(response);
                                return;
                            }
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
                let select = req.body.select || { id: 1, code: 1, customer: 1, itemsList: 1, paymentType: 1, store: 1, active: 1, image: 1 };
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
                        res.json({ done: true, list: docs });
                    });
                }
            });
        }
    }

    app.init();
    site.addApp(app);
};
