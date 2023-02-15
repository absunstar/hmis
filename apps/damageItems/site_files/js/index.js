app.controller('damageItems', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'damageItems';
    $scope.modalID = '#damageItemsManageModal';
    $scope.modalSearchID = '#damageItemsSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        active: true,
    };
    $scope.item = {};
    $scope.orderItem = {};
    $scope.list = [];
    $scope.canApprove = false;
    $scope.resetOrderItem = function () {
        $scope.orderItem = {
            item: undefined,
            unit: undefined,
            count: 1,
            price: 0,
            saleDiscount: 0,
            maxDiscount: 0,
            discountType: { amount: 'amount', percent: 'percent' },
            total: 0,
        };
    };
    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.itemsError = '';
        $scope.mode = 'add';
        $scope.resetOrderItem();
        $scope.item = { ...$scope.structure, date: new Date(), itemsList: [] };
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
        $scope.resetOrderItem();
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
                where: where,
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
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
                price: elem.salesPrice,
                maxDiscount: elem.maxDiscount,
                saleDiscount: elem.saleDiscount,
                discountType: elem.discountType,
            });
            $scope.orderItem.unit = $scope.unitsList[0];
        }
    };

    $scope.addToItemsList = function (orderItem) {
        $scope.itemsError = '';
        if (!orderItem.item.id) {
            $scope.itemsError = '##word.Please Enter Item##';
            return;
        }

        if (!orderItem.unit.id) {
            $scope.itemsError = '##word.Please Enter Item Unit##';
            return;
        }

        if (!orderItem.count > 0) {
            $scope.itemsError = '##word.Please Enter Count##';
            return;
        }

        $scope.item.itemsList.unshift({
            id: orderItem.item.id,
            code: orderItem.item.code,
            nameAr: orderItem.item.nameAr,
            nameEn: orderItem.item.nameEn,
            itemGroup: orderItem.item.itemGroup,
            destroyingReason: orderItem.destroyingReason,
            unit: { id: orderItem.unit.id, code: orderItem.unit.code, nameAr: orderItem.unit.nameAr, nameEn: orderItem.unit.nameEn },
            count: orderItem.count,
            price: orderItem.unit.price,
            approved: false,
        });
        $scope.resetOrderItem();
        $scope.itemsError = '';
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
                    search: $search,
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
                    allowSale: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    unitsList: 1,
                    itemGroup: 1,
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

    $scope.calculateItem = function (itm) {
        if (itm.count < 0 || itm.price < 0) {
            $scope.itemsError = '##word.Please Enter Valid Numbers##';
            return;
        }
        $timeout(() => {
            const index = $scope.item.itemsList.findIndex((elem) => elem.id === itm.id && elem.unit.id === itm.unit.id);
            if (index !== -1) {
                $scope.item.itemsList[index].total = $scope.item.itemsList[index].count * $scope.item.itemsList[index].price;
            }
        }, 300);

        $scope.itemsError = '';
    };

    $scope.getReasonsDestroyingItems = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }

        $scope.busy = true;
        $scope.destroyingItemsReasonsList = [];
        $http({
            method: 'POST',
            url: '/api/reasonsDestroyingItems/all',
            data: {
                where: { active: true, search: $search },
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
                    $scope.destroyingItemsReasonsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.approveItem = function (elem) {
        $scope.error = '';
        if (elem.count < 1) {
            $scope.error = '##word.Please Enter Valid Numbers##';
            return;
        }

        const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === elem.id && _elm.unit.id === elem.unit.id);
        if (itemIndex !== -1) {
            $scope.item.itemsList[itemIndex].approved = true;
        }

        $scope.prpepareToApproveOrder($scope.item);
    };

    $scope.unapproveItem = function (item) {
        const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === item.id && _elm.unit.id === item.unit.id);
        if (itemIndex !== -1) {
            $scope.item.itemsList[itemIndex].approved = false;
            $scope.canApprove = false;
        }
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
            $scope.error = '##word.Must Enter One Item At Least##';
            return;
        }

        if (_item.itemsList.some((itm) => !itm.approved)) {
            $scope.error = '##word.Must Approve All Items##';
            return;
        }

        _item['approved'] = true;
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

        success = true;
        return { success, _item };
    };
    $scope.getReasonsDestroyingItems();
    $scope.getAll();
    // $scope.getStores();
    $scope.getStoresItems();
    $scope.getNumberingAuto();
});
