module.exports = function init(site) {
    let app = {
        name: 'storesItems',
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
        allowRouteActive: true,
    };

    site.editItemsBalance = function (_elm) {
        app.view({ id: _elm.item.id }, (err, doc) => {
            if (doc) {
                let index = doc.unitsList.findIndex((unt) => unt.unit.id === _elm.unit.id);

                if (index != -1) {
                    let storeIndex = doc.unitsList[index].storesList.findIndex((s) => s.store.id === _elm.store.id);
                    if (storeIndex == -1) {
                        const newUitStore = site.setStoresItemsUnitStoreProperties();
                        newUitStore.store = _elm.store;
                        newUitStore.purchaseCost = _elm.purchaseCost ?? newUitStore.purchaseCost;
                        newUitStore.purchaseCount = _elm.purchaseCount ?? newUitStore.purchaseCount;
                        newUitStore.purchasePrice = _elm.purchasePrice ?? newUitStore.purchasePrice;
                        newUitStore.bonusCount = _elm.bonusCount ?? newUitStore.bonusCount;
                        newUitStore.bonusPrice = _elm.bonusPrice ?? newUitStore.bonusPrice;
                        newUitStore.purchaseReturnCount = _elm.purchaseReturnCount ?? newUitStore.purchaseReturnCount;
                        newUitStore.purchaseReturnPrice = _elm.purchaseReturnPrice ?? newUitStore.purchaseReturnPrice;
                        newUitStore.salesCount = _elm.salesCount ?? newUitStore.salesCount;
                        newUitStore.salesPrice = _elm.salesPrice ?? newUitStore.salesPrice;
                        newUitStore.salesReturnCount = _elm.salesReturnCount ?? newUitStore.salesReturnCount;
                        newUitStore.salesReturnPrice = _elm.salesReturnPrice ?? newUitStore.salesReturnPrice;
                        newUitStore.damagedCount = _elm.damagedCount ?? newUitStore.damagedCount;
                        newUitStore.damagedPrice = _elm.damagedPrice ?? newUitStore.damagedPrice;
                        newUitStore.assembledCount = _elm.assembledCount ?? newUitStore.assembledCount;
                        newUitStore.assembledPrice = _elm.assembledPrice ?? newUitStore.assembledPrice;
                        newUitStore.unassembledCount = _elm.unassembledCount ?? newUitStore.unassembledCount;
                        newUitStore.unassembledPrice = _elm.unassembledPrice ?? newUitStore.unassembledPrice;
                        newUitStore.transferFromCount = _elm.transferFromCount ?? newUitStore.transferFromCount;
                        newUitStore.transferToCount = _elm.transferToCount ?? newUitStore.transferToCount;
                        newUitStore.transferFromPrice = _elm.transferFromPrice ?? newUitStore.transferFromPrice;
                        newUitStore.transferToPrice = _elm.transferToPrice ?? newUitStore.transferToPrice;
                        doc.unitsList[index].storesList.push(newUitStore);
                    } else {
                        doc.unitsList[index].storesList[storeIndex].purchaseCount += _elm.purchaseCount;
                        doc.unitsList[index].storesList[storeIndex].purchaseCost += _elm.purchaseCost;
                        doc.unitsList[index].storesList[storeIndex].purchasePrice += _elm.purchasePrice;
                        doc.unitsList[index].storesList[storeIndex].bonusCount += _elm.bonusCount;
                        doc.unitsList[index].storesList[storeIndex].bonusPrice += _elm.bonusPrice;
                        doc.unitsList[index].storesList[storeIndex].purchaseReturnCount = _elm.purchaseReturnCount;
                        doc.unitsList[index].storesList[storeIndex].purchaseReturnPrice = _elm.purchaseReturnPrice;
                        doc.unitsList[index].storesList[storeIndex].salesCount = _elm.salesCount;
                        doc.unitsList[index].storesList[storeIndex].salesPrice = _elm.salesPrice;
                        doc.unitsList[index].storesList[storeIndex].salesReturnCount = _elm.salesReturnCount;
                        doc.unitsList[index].storesList[storeIndex].salesReturnPrice = _elm.salesReturnPrice;
                        doc.unitsList[index].storesList[storeIndex].damagedCount = _elm.damagedCount;
                        doc.unitsList[index].storesList[storeIndex].damagedPrice = _elm.damagedPrice;
                        doc.unitsList[index].storesList[storeIndex].assembledCount = _elm.assembledCount;
                        doc.unitsList[index].storesList[storeIndex].assembledPrice = _elm.assembledPrice;
                        doc.unitsList[index].storesList[storeIndex].unassembledCount = _elm.unassembledCount;
                        doc.unitsList[index].storesList[storeIndex].unassembledPrice = _elm.unassembledPrice;
                        doc.unitsList[index].storesList[storeIndex].transferFromCount = _elm.transferFromCount;
                        doc.unitsList[index].storesList[storeIndex].transferToCount = _elm.transferToCount;
                        doc.unitsList[index].storesList[storeIndex].transferFromPrice = _elm.transferFromPrice;
                        doc.unitsList[index].storesList[storeIndex].transferToPrice = _elm.transferToPrice;
                    }
                }

                app.update(doc);
            }
        });
    };

    site.calculateStroeItemBalance = function (item) {
        item.unitsList.forEach((unt) => {
            unt.storesList.forEach((str) => {
                let totalIncome = str.purchaseCount + str.bonusCount + str.unassembledCount + str.salesReturnCount;
                let totalOut = str.salesCount + str.purchaseReturnCount + str.damagedCount + str.assembledCount;
                str.currentBalance = totalIncome - totalOut;
            });
        });
        return item;
    };

    site.setStoresItemsUnitStoreProperties = function () {
        return {
            store: {},
            purchaseCost: 0,
            purchaseCount: 0,
            purchasePrice: 0,
            purchaseReturnCount: 0,
            purchaseReturnPrice: 0,
            salesCount: 0,
            salesPrice: 0,
            salesReturnCount: 0,
            salesReturnPrice: 0,
            bonusCount: 0,
            bonusPrice: 0,
            damagedCount: 0,
            damagedPrice: 0,
            assembledCount: 0,
            assembledPrice: 0,
            unassembledCount: 0,
            unassembledPrice: 0,
            transferFromCount: 0,
            transferToCount: 0,
            transferFromPrice: 0,
            transferToPrice: 0,
        };
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
                    res.render(app.name + '/index.html', { title: app.name, appName: 'Stores Items' }, { parser: 'html', compres: true });
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
                        response.error = 'Code Exisit';
                        res.json(response);
                        return;
                    }
                    _data.addUserInfo = req.getUserFinger();

                    app.add(_data, (err, doc) => {
                        if (!err && doc) {
                            response.done = true;
                            response.doc = doc;
                        } else {
                            response.error = err.mesage;
                        }
                        res.json(response);
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
                        response.error = 'Code Exisit';
                        return res.json(response);
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

                let select = req.body.select || {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    image: 1,
                    active: 1,
                };
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
