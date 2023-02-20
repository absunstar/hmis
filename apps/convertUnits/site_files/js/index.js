app.controller('convertUnits', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'convertUnits';
    $scope.modalID = '#convertUnitsManageModal';
    $scope.modalSearchID = '#convertUnitsSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: {},
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
        $scope.item = { ...$scope.structure, date: new Date(), filesList: [], itemsList: [] };
        $scope.orderItem = { ...$scope.orderItem, count: 0 };
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

        if (!$scope.item.itemsList.length) {
            alert('##word.Must Enter Items Data##');
            return success;
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

        if (!_item.itemsList.length) {
            alert('##word.Must Enter Items Data##');
            return success;
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

    $scope.getStores = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }
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
                search: $search,
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

    $scope.getStoresItems = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }
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
                search: $search,
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
        if (item.unitsList) {
            console.log('item.unitsList', item.unitsList[0]);

            for (const elem of item.unitsList) {
                console.log('elem', elem);
                $scope.unitsList.push({
                    id: elem.unit.id,
                    code: elem.unit.code,
                    nameAr: elem.unit.nameAr,
                    nameEn: elem.unit.nameEn,
                    price: elem.purchasePrice,
                    currentCount: elem.currentCount,
                    conversion: elem.conversion,
                    newCount: elem.newCount || 0,
                });
            }
            $scope.orderItem.unit = $scope.unitsList[0];
            $scope.orderItem.currentCount = $scope.unitsList[0]?.currentCount;
        }
        $scope.calculateConversionUnits();
    };

    $scope.calculateConversionUnits = function () {
        $scope.itemsError = '';
        const unit = $scope.orderItem.unit;
        const toUnit = $scope.orderItem.toUnit;
        $timeout(() => {
            const count = $scope.orderItem.count;
            if (count < 0) {
                alert('##word.Please Enter Valid Numbers##');
                $scope.orderItem.count = 0;
                return;
            }

            if (unit && toUnit && unit.id && toUnit.id) {
                unit.newCount = unit.currentCount - count / unit.conversion;
                toUnit.newCount = (count * unit.conversion) / toUnit.conversion;
            }
        }, 300);
    };

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
        if (!orderItem.toUnit.id) {
            alert('##word.Please Enter Item To Unit##');
            return;
        }

        if (orderItem.unit.id === orderItem.toUnit.id) {
            alert('##word.Cannot Make Convert To Same Unit##');
            return;
        }

        const index = $scope.item.itemsList.findIndex((_elem) => _elem.id === orderItem.id && _elem.unit.id === orderItem.unit.id);
        if (index !== -1) {
            alert('##word.Item Exisit##');
            return;
        }

        if (orderItem.unit.newCount < 0) {
            alert('##word.From Unit Balance Insufficient##');
            return;
        }

        if (!Number.isInteger(orderItem.toUnit.newCount)) {
            alert('##word.Conversion Value Must Be Integer##');
            return;
        }

        console.log('orderItem.unit', orderItem.unit);
        console.log('orderItem.toUnit', orderItem.toUnit);

        $scope.item.itemsList.unshift({
            id: orderItem.item.id,
            code: orderItem.item.code,
            nameAr: orderItem.item.nameAr,
            nameEn: orderItem.item.nameEn,
            itemGroup: orderItem.item.itemGroup,
            unit: {
                id: orderItem.unit.id,
                code: orderItem.unit.code,
                nameAr: orderItem.unit.nameAr,
                nameEn: orderItem.unit.nameEn,
                currentCount: orderItem.unit.currentCount,
                price: orderItem.unit.price,
                count: orderItem.unit.conversion * orderItem.count,
                newCount: orderItem.unit.currentCount - orderItem.unit.conversion * orderItem.count,
            },
            toUnit: {
                id: orderItem.toUnit.id,
                code: orderItem.toUnit.code,
                nameAr: orderItem.toUnit.nameAr,
                nameEn: orderItem.toUnit.nameEn,
                currentCount: orderItem.toUnit.currentCount,
                newCount: orderItem.toUnit.newCount,
                price: orderItem.toUnit.price,
            },

            approved: false,
        });
        $scope.orderItem = { ...$scope, orderItem };
        $scope.itemsError = '';
    };

    $scope.approveItem = function (_item) {
        if (!_item.id) {
            alert('##word.Please Enter Item##');
            return;
        }
        if (!_item.unit.id) {
            alert('##word.Please Enter Item Unit##');
            return;
        }

        if (_item.unit.id === _item.toUnit.id) {
            alert('##word.Cannot Make Convert To Same Unit##');
            return;
        }

        const index = $scope.item.itemsList.findIndex((_elem) => _elem.id === _item.id && _elem.unit.id === _item.unit.id && _elem.toUnit.id === _item.toUnit.id);

        if (index !== -1) {
            $scope.item.itemsList[index].approved = true;
        }
        $scope.prpepareToApproveOrder($scope.item);
        $scope.itemsError = '';
    };

    $scope.unapproveItem = function (item) {
        const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === item.id && _elm.unit.id === item.unit.id && _elm.toUnit.id === item.toUnit.id);
        if (itemIndex !== -1) {
            $scope.item.itemsList[itemIndex].approved = false;
            $scope.canApprove = false;
        }
    };

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

    $scope.prpepareToApproveOrder = function (_item) {
        $scope.canApprove = false;
        const index = _item.itemsList.findIndex((elem) => elem.approved == false);
        if (index === -1) {
            $scope.canApprove = true;
        }
    };

    $scope.approve = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }
        if (!_item.itemsList.length) {
            alert('##word.Must Enter Items Data##');
            return success;
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

    $scope.getAll();
    $scope.getStores();
    $scope.getStoresItems();
    $scope.getNumberingAuto();
});
