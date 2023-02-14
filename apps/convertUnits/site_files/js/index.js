app.controller('convertUnits', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'convertUnits';
    $scope.modalID = '#convertUnitsManageModal';
    $scope.modalSearchID = '#convertUnitsSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: {},
        date: new Date(),
        approved: false,
        active: true,
    };
    $scope.item = {};
    $scope.list = [];
    $scope.orderItem = {};
    $scope.canApprove = false;

    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.itemsError = '';
        $scope.mode = 'add';
        $scope.item = { ...$scope.structure, filesList: [], itemsList: [] };
        $scope.orderItem = { ...$scope.orderItem };

        site.showModal($scope.modalID);
    };

    $scope.add = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }
        delete _item.purchaseRequest?.itemsList;
        delete _item.purchaseRequest?.approved;
        delete _item.purchaseRequest?.hasTransaction;
        let dataValid = $scope.validateData(_item);
        if (!dataValid.success) {
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
        $scope.prpepareToApproveOrder(_item);
        $scope.view(_item);
        $scope.item = {};
        site.showModal($scope.modalID);
    };

    $scope.update = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }
        delete _item.purchaseRequest?.itemsList;
        delete _item.purchaseRequest?.approved;
        delete _item.purchaseRequest?.hasTransaction;
        let dataValid = $scope.validateData(_item);
        if (!dataValid.success) {
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
                where: {
                    approved: false,
                },
                select: {
                    id: 1,
                    code: 1,
                    sourceType: 1,
                    date: 1,
                    store: 1,
                    itemsList: 1,
                    image: 1,
                    active: 1,
                    approved: 1,
                    approvedDate: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.list = response.data.list;
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

    $scope.getStoresItems = function () {
        $scope.busy = true;
        $scope.itemsList = [];
        $http({
            method: 'POST',
            url: '/api/storesItems/all',
            data: {
                where: {
                    active: true,
                    collectionItem: false,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    itemGroup: 1,
                    unitsList: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.itemsList = response.data.list;
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

    $scope.getItemUnits = function (item) {
        $scope.unitsList = [];
        for (const elem of item.unitsList) {
            $scope.unitsList.push({
                id: elem.unit.id,
                code: elem.unit.code,
                nameAr: elem.unit.nameAr,
                nameEn: elem.unit.nameEn,
                currentCount: elem.currentCount,
                conversion: elem.conversion,
            });
        }
        $scope.orderItem.unit = $scope.unitsList[0];
        $scope.orderItem.currentCount = $scope.unitsList[0]?.currentCount;

        // $scope.calucualteStoreBalance($scope.unitsList[0]);
    };

    // $scope.calucualteStoreBalance = function (unit) {
    //     const storesBalanceList = [];
    //     let totalBalance = 0;
    //     unit.storesList.forEach((store) => {
    //         const totalIncome = store.purchaseCount + store.salesReturnCount + store.bonusCount + store.unassembledCount + store.transferToCount;
    //         const totalOut = store.purchaseReturnCount + store.salesCount + store.damagedCount + store.assembledCount + store.transferFromCount;
    //         const currentBalance = totalIncome - totalOut;
    //         totalBalance += currentBalance;
    //         storesBalanceList.push({
    //             store: store.store,
    //             currentBalance,
    //         });
    //     });

    //     return { storesBalanceList, totalBalance };
    // };

    $scope.addToItemsList = function (orderItem) {
        $scope.itemsError = '';
        if (!orderItem.item.id) {
            alert('##word.Please Enter Item##');
            return;
        }
        if (!orderItem.unit.id) {
            alert('##word.Please Enter Item Unit##');
            return;
        }
        if (orderItem.unit.id === orderItem.toUnit.id) {
            alert('##word.Cannot Make Convert To Same Unit##');
            return;
        }

        if (orderItem.count % orderItem.toUnit.conversion !== 0) {
            alert('##word.Please Enter Valid Conversion Number##');
            return;
        }

        $scope.item.itemsList.unshift({
            id: orderItem.item.id,
            code: orderItem.item.code,
            nameAr: orderItem.item.nameAr,
            nameEn: orderItem.item.nameEn,
            itemGroup: orderItem.item.itemGroup,
            unit: orderItem.unit,
            currentCount: orderItem.unit.currentCount,
            count: orderItem.count,
            toUnit: orderItem.toUnit,
            conversion: orderItem.toUnit.conversion,
            newCount: orderItem.toUnit.currentCount + orderItem.count / orderItem.toUnit.conversion,
        });
        $scope.orderItem = { ...$scope, orderItem };
        $scope.itemsError = '';
    };

    // $scope.approveItem = function (item) {
    //     if (!item.purchasePrice > 0) {
    //         $scope.itemsError = '##word.Please Enter Price##';
    //         return;
    //     }
    //     if (item.purchaseCount < 1) {
    //         $scope.itemsError = '##word.Please Enter Count##';
    //         return;
    //     }
    //     const index = $scope.item.itemsList.findIndex((_elem) => _elem.id === item.id);
    //     if (index !== -1) {
    //         $scope.item.itemsList[index].approved = true;
    //     }
    //     $scope.prpepareToApproveOrder($scope.item);
    //     $scope.itemsError = '';
    // };

    // $scope.unapproveItem = function (item) {
    //     const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === item.id);
    //     if (itemIndex !== -1) {
    //         $scope.item.itemsList[itemIndex].approved = false;
    //         $scope.canApprove = false;
    //     }
    // };

    $scope.calculateTotalInItemsList = function (itm) {
        if (itm.purchaseCount < 0 || itm.purchasePrice < 0) {
            $scope.itemsError = '##word.Please Enter Valid Numbers##';
            return;
        }
        const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === itm.id);
        const selectdItem = $scope.item.itemsList[itemIndex];
        if (itemIndex !== -1) {
            selectdItem.total = selectdItem.purchaseCount * selectdItem.purchasePrice;
        }

        $scope.itemsError = '';
    };

    // $scope.prpepareToApproveOrder = function (_item) {
    //     $scope.canApprove = false;
    //     const index = _item.itemsList.findIndex((elem) => elem.approved == false);

    //     if (index == -1) {
    //         $scope.canApprove = true;
    //     }
    // };

    $scope.approve = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }
        delete _item.purchaseRequest?.itemsList;
        delete _item.purchaseRequest?.approved;
        delete _item.purchaseRequest?.hasTransaction;
        let dataValid = $scope.validateData(_item);
        if (!dataValid.success) {
            return;
        }
        _item.approved = true;
        _item.approvedDate = new Date();
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
                    $scope.error = 'Please Login First';
                }
            },
            function (err) {
                console.log(err);
            }
        );
    };

    $scope.validateData = function (_item) {
        $scope.itemsError = '';
        $scope.error = '';
        let success = false;
        if (!_item.itemsList.length) {
            $scope.itemsError = '##word.Must Enter Items Data##';
            return success;
        }
        // if (_item.calculatePurchaseCost) {
        //     if (!_item.calculatePurchaseCostType) {
        //         alert('##word.Please Select Calculate Purchase Cost Type##');
        //         return success;
        //     }
        //     if (!_item.purchaseCost > 0) {
        //         alert('##word.Please Enter Calculate Purchase Cost##');
        //         return success;
        //     }
        // }
        success = true;
        return { success, _item };
    };

    $scope.getAll();
    $scope.getStores();
    $scope.getStoresItems();
    $scope.getNumberingAuto();
});
