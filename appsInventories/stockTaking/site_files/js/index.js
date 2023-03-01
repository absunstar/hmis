app.controller('stockTaking', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'stockTaking';
    $scope.modalID = '#stockTakingManageModal';
    $scope.modalSearchID = '#stockTakingSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        itemsList: [],
        approved: false,
    };
    $scope.item = {};
    $scope.list = [];
    $scope.canApprove = false;
    $scope.resetOrderItem = function () {
        $scope.orderItem = {
            count: 1,
            approved: false,
            currentBalance: 0,
        };
    };
    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.itemsError = '';
        $scope.mode = 'add';
        $scope.resetOrderItem();
        $scope.item = { ...$scope.structure, itemsList: [], date: new Date() };
        $scope.canApprove = false;
        site.showModal($scope.modalID);
    };

    $scope.add = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }

        if (!_item.itemsList.length) {
            $scope.error = '##word.Must Enter One Item At Least##';
            return;
        }
        if (_item.store && _item.toStore && _item.store.id === _item.toStore.id) {
            $scope.error = '##word.Same Store##';
            return;
        }
        $scope.busy = true;
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/add`,
            data: $scope.item,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal($scope.modalID);
                    site.resetValidated($scope.modalID);
                    $scope.list.push(response.data.doc);
                } else {
                    $scope.error = response.data.error;
                    if (response.data.error && response.data.error.like('*Must Enter Code*')) {
                        $scope.error = '##word.Must Enter Code##';
                    }
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.showUpdate = function (_item) {
        $scope.error = '';
        $scope.itemsError = '';
        $scope.mode = 'edit';
        $scope.resetOrderItem();
        $scope.prpepareToApproveOrder(_item);
        $scope.view(_item);
        $scope.item = {};
        site.showModal($scope.modalID);
    };
    $scope.startStockTaking = function (_item) {
        $http({
            method: 'POST',
            url: '/api/handelItemsData/all',
            data: { items: _item.itemsList, storeId: _item.store.id, getBatchesList: true },
        }).then(function (response) {
            $scope.busy = false;
            if (response.data.done && response.data.list.length > 0) {
                _item.itemsList = [];
                for (const elem of response.data.list) {
                    _item.itemsList.push({
                        id: elem.id,
                        code: elem.code,
                        nameAr: elem.nameAr,
                        nameEn: elem.nameEn,
                        itemGroup: elem.itemGroup,
                        currentCount: elem.storeBalance,
                        unit: elem.unit,
                        count: 0,
                        price: elem.price,
                        workByBatch: elem.workByBatch,
                        workBySerial: elem.workBySerial,
                        validityDays: elem.validityDays,
                        batchesList: elem.batchesList,
                        approved: false,
                    });
                }
                _item.startStockTaking = true;
                $http({
                    method: 'POST',
                    url: `${$scope.baseURL}/api/${$scope.appName}/update`,
                    data: _item,
                }).then(
                    function (response) {
                        $scope.busy = false;
                        if (response.data.done) {
                            site.hideModal($scope.modalID);
                            let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
                            if (index !== -1) {
                                $scope.list[index] = response.data.result.doc;
                            }
                        } else {
                            $scope.error = 'Please Login First';
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }
        });
    };

    $scope.update = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }
        if (!_item.itemsList.length) {
            $scope.error = '##word.Must Enter One Item At Least##';
            return;
        }

        if (_item.store && _item.toStore && _item.store.id === _item.toStore.id) {
            $scope.error = '##word.Same Store##';
            return;
        }
        $scope.busy = true;
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/update`,
            data: _item,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal($scope.modalID);
                    site.resetValidated($scope.modalID);
                    let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
                    if (index !== -1) {
                        $scope.list[index] = response.data.result.doc;
                    }
                } else {
                    $scope.error = 'Please Login First';
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.approve = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }
        if (!_item.itemsList.length) {
            $scope.error = '##word.Must Enter One Item At Least##';
            return;
        }

        if (_item.itemsList.some((itm) => !itm.approved)) {
            $scope.error = '##word.Must Approve All Items##';
            return;
        }

        if (_item.store && _item.toStore && _item.store.id === _item.toStore.id) {
            $scope.error = '##word.Same Store##';
            return;
        }
        $scope.busy = true;
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/approve`,
            data: _item,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal($scope.modalID);
                    site.resetValidated($scope.modalID);
                    let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
                    if (index !== -1) {
                        $scope.list[index] = response.data.result.doc;
                    }
                } else {
                    $scope.error = response.data.error || 'Please Login First';
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.showView = function (_item) {
        $scope.error = '';
        $scope.mode = 'view';
        $scope.item = {};
        $scope.view(_item);
        site.showModal($scope.modalID);
    };

    $scope.view = function (_item) {
        $scope.busy = true;
        $scope.error = '';
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/view`,
            data: {
                id: _item.id,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.item = response.data.doc;
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.showDelete = function (_item) {
        $scope.error = '';
        $scope.mode = 'delete';
        $scope.item = {};
        $scope.view(_item);
        site.showModal($scope.modalID);
    };

    $scope.delete = function (_item) {
        $scope.busy = true;
        $scope.error = '';

        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/delete`,
            data: {
                id: $scope.item.id,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal($scope.modalID);
                    let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
                    if (index !== -1) {
                        $scope.list.splice(index, 1);
                    }
                } else {
                    $scope.error = response.data.error;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.getAll = function (where) {
        $scope.busy = true;
        $scope.list = [];
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/all`,
            data: {
                where: where,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.list = response.data.list;
                    console.log($scope.list);
                    $scope.count = response.data.count;
                    site.hideModal($scope.modalSearchID);
                    $scope.search = {};
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getNumberingAuto = function () {
        $scope.error = '';
        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/numbering/getAutomatic',
            data: {
                screen: $scope.appName,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.disabledCode = response.data.isAuto;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.showSearch = function () {
        $scope.error = '';
        site.showModal($scope.modalSearchID);
    };

    $scope.searchAll = function () {
        $scope.getAll($scope.search);
        site.hideModal($scope.modalSearchID);
        $scope.search = {};
    };

    $scope.getStores = function () {

        $scope.busy = true;
        $scope.storesList = [];
        $http({
            method: 'POST',
            url: '/api/stores/all',
            data: {
                where: {
                    active: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.storesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getItemsGroups = function () {
        $scope.busy = true;
        $scope.itemsGroupsList = [];
        $http({
            method: 'POST',
            url: '/api/itemsGroups/all',
            data: {
                where: {
                    active: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                }
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.itemsGroupsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getManyStoresItems = function (type) {
        $scope.busy = true;
        $scope.manyStoresItemsList = [];
        let where = {
            active: true,
        };

        where['unitsList.storesList.store.id'] == $scope.item.store.id;
        if (type == 'itemGroup' && $scope.item.$itemGroup && $scope.item.$itemGroup.id) {
            where['itemGroup.id'] == $scope.item.$itemGroup.id;
        }

        $http({
            method: 'POST',
            url: '/api/storesItems/all',
            data: {
                where: where,
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    workByBatch: 1,
                    workBySerial: 1,
                    validityDays: 1,
                    unitsList: 1,
                    itemGroup: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.manyStoresItemsList = response.data.list;
                    $scope.manyStoresItemsList.forEach((_item) => {
                        if (!$scope.item.itemsList.some((itm) => itm.id == _item.id)) {
                            _item.unitsList.forEach((_unit) => {
                                let storeIndex = _unit.storesList.findIndex((_s) => _s.store.id === $scope.item.store.id);
                                if (storeIndex != -1) {
                                    let item = {
                                        id: _item.id,
                                        code: _item.code,
                                        nameAr: _item.nameAr,
                                        nameEn: _item.nameEn,
                                        itemGroup: _item.itemGroup,
                                        unit: { id: _unit.unit.id, code: _unit.unit.code, nameAr: _unit.unit.nameAr, nameEn: _unit.unit.nameEn },
                                        currentCount: _unit.storesList[storeIndex].currentCount,
                                        count: 0,
                                        price: _unit.unit.purchasePrice,
                                        approved: false,
                                    };
                                    if (_item.workByBatch || _item.workBySerial) {
                                        item.batchesList = _unit.storesList[storeIndex].batchesList;
                                    }
                                    $scope.item.itemsList.unshift(item);
                                }
                            });
                        }
                    });
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getStoresItems = function ($search) {
        $scope.error = '';
        if ($search && $search.length < 1) {
            return;
        }

        if (!$scope.item.store || !$scope.item.store.id) {
            $scope.error = '##word.Please Select Store';
            return;
        }
        $scope.busy = true;
        $scope.storesItemsList = [];
        $http({
            method: 'POST',
            url: '/api/storesItems/all',
            data: {
                storeId: $scope.item.store.id,
                where: {
                    active: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    workByBatch: 1,
                    workBySerial: 1,
                    validityDays: 1,
                    unitsList: 1,
                    itemGroup: 1,
                },
                search: $search,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.storesItemsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getItemUnits = function (item) {
        $scope.unitsList = [];
        for (const elem of item.unitsList) {
            $scope.unitsList.push({
                id: elem.unit.id,
                code: elem.unit.code,
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
                storesList: elem.storesList,
                purchasePrice: elem.purchasePrice,
            });
            $scope.orderItem.unit = $scope.unitsList[0];
        }
    };

    $scope.addToItemsList = function (elem) {
        if (!elem.item || !elem.item?.id) {
            $scope.error = '##word.Please Enter Item##';
            return;
        }
        for (const itm of $scope.item.itemsList) {
            if (itm.id === elem.item.id && itm.unit.id === elem.unit.id) {
                $scope.error = '##word.Item Exisit##';
                return;
            }
        }
        if (elem.count < 1) {
            $scope.error = '##word.Please Enter Count##';
            return;
        }

        $scope.item.itemsList.unshift({
            id: elem.item.id,
            code: elem.item.code,
            nameAr: elem.item.nameAr,
            nameEn: elem.item.nameEn,
            itemGroup: elem.item.itemGroup,
            unit: { id: elem.unit.id, code: elem.unit.code, nameAr: elem.unit.nameAr, nameEn: elem.unit.nameEn },
            currentCount: elem.count,
            price: elem.unit.purchasePrice,
            approved: false,
        });

        $scope.itemsError = '';
    };

    $scope.approveItem = function (i) {
        $scope.itemsError = '';

        $scope.item.itemsList[i].approved = true;
        /*   if (elem.count < 1) {
      $scope.itemsError = '##word.Please Enter Valid Numbers##';
      return;
    } else { */

        /*  } */

        $scope.prpepareToApproveOrder($scope.item);
    };

    $scope.unapproveItem = function (i) {
        $scope.item.itemsList[i].approved = false;
        $scope.canApprove = false;
    };

    $scope.prpepareToApproveOrder = function (_item) {
        $scope.canApprove = false;
        const index = _item.itemsList.findIndex((elem) => elem.approved == false);
        if (index === -1) {
            $scope.canApprove = true;
        }
    };
    $scope.addFiles = function () {
        $scope.error = '';
        $scope.item.filesList = $scope.item.filesList || [];
        $scope.item.filesList.push({
            file_date: new Date(),
            file_upload_date: new Date(),
            upload_by: '##user.name##',
        });
    };

    $scope.addNewBatch = function (item) {
        $scope.errorBatch = '';
        let obj = {};
        if (item.workByBatch) {
            obj = {
                productionDate: new Date(),
                expiryDate: new Date($scope.addDays(new Date(), item.validityDays || 0)),
                validityDays: item.validityDays || 0,
                count: 0,
            };
        } else if (item.workBySerial) {
            obj = {
                productionDate: new Date(),
                count: 1,
            };
        }
        item.batchesList.unshift(obj);
        $scope.calcBatch(item);
    };

    $scope.saveBatch = function (item) {
        $scope.errorBatch = '';
        $scope.error = '';
        const v = site.validated('#batchModalModal');
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }

        if (item.$batchCount === item.count) {
            site.hideModal('#batchModalModal');
        } else {
            $scope.errorBatch = 'The Count is not correct';
            return;
        }
    };

    $scope.showBatchModal = function (item) {
        $scope.error = '';
        $scope.errorBatch = '';
        $scope.batch = item;
        item.batchesList = item.batchesList || [];
        if (item.batchesList.length < 1) {
            let obj = {};
            if (item.workByBatch) {
                obj = {
                    productionDate: new Date(),
                    expiryDate: new Date($scope.addDays(new Date(), item.validityDays || 0)),
                    validityDays: item.validityDays || 0,
                    count: item.count,
                };
                item.batchesList = [obj];
            }
        }
        $scope.calcBatch(item);
        site.showModal('#batchModalModal');
    };

    $scope.addDays = function (date, days) {
        let result = new Date(date);
        result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
        return result;
    };

    $scope.changeDate = function (i, str) {
        $timeout(() => {
            $scope.errorBatch = '';
            $scope.error = '';

            if (str == 'exp') {
                let diffTime = Math.abs(new Date(i.expiryDate) - new Date(i.productionDate));
                i.validityDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else if (str == 'pro') {
                i.expiryDate = new Date($scope.addDays(i.productionDate, i.validityDays || 0));
            }
        }, 250);
    };

    $scope.calcBatch = function (item) {
        $timeout(() => {
            $scope.errorBatch = '';
            $scope.error = '';
            item.$batchCount = item.batchesList.length > 0 ? item.batchesList.reduce((a, b) => +a + +b.count, 0) : 0;
        }, 250);
    };

    $scope.getAll({ date: new Date() });
    $scope.getItemsGroups();
    $scope.getStores();
    $scope.getNumberingAuto();
});
