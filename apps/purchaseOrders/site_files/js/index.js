app.controller('purchaseOrders', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'purchaseOrders';
    $scope.modalID = '#purchaseOrdersManageModal';
    $scope.modalSearchID = '#purchaseOrdersSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: { url: '/images/purchaseOrders.png' },
        source: undefined,
        purchaseRequest: undefined,
        orderDate: new Date(),
        paymentType: undefined,
        importPermitNumber: 0,
        importAuthorizationDate: new Date(),
        store: undefined,
        vendor: undefined,
        itemsList: [],
        hasVendor: true,
        approved: false,
        calculatePurchaseCost: false,
        calculatePurchaseCostType: { bill: 'bill', items: 'items' },
        purchaseCost: 0,
        active: true,
    };
    $scope.item = {};
    $scope.list = [];
    $scope.orderItem = {
        item: undefined,
        unit: undefined,
        purchaseCount: 1,
        purchasePrice: 0,
        bonusCount: 0,
        bonusPrice: 0,
        vat: 0,
        total: 0,
        approved: false,
    };
    $scope.canApprove = false;
    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.mode = 'add';
        $scope.item = { ...$scope.structure };
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
        $scope.mode = 'edit';
        $scope.view(_item);
        $scope.item = {};
        $scope.prpepareToApproveOrder(_item);
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
                    source: 1,
                    orderDate: 1,
                    paymentType: 1,
                    importPermitNumber: 1,
                    importAuthorizationDate: 1,
                    vendor: 1,
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

    $scope.getpurchaseOrdersSource = function () {
        $scope.busy = true;
        $scope.purchaseOrdersSourcesList = [];
        $http({
            method: 'POST',
            url: '/api/purchaseOrdersSource',
            data: {
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
                    $scope.purchaseOrdersSourcesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getPaymentTypes = function () {
        $scope.busy = true;
        $scope.paymentTypesList = [];
        $http({
            method: 'POST',
            url: '/api/paymentTypes',
            data: {
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
                    $scope.paymentTypesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getVendors = function () {
        $scope.busy = true;
        $scope.vendorsList = [];
        $http({
            method: 'POST',
            url: '/api/vendors/all',
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
                    $scope.vendorsList = response.data.list;
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
                    'type.id': 1,
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
                    allowBuy: true,
                    collectionItem: false,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
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
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
            });
            $scope.orderItem.unit = $scope.unitsList[0];
        }
    };
    $scope.getPurchaseRequest = function () {
        $scope.busy = true;
        $scope.purchaseRequestList = [];
        $scope.item.itemsList = [];
        $http({
            method: 'POST',
            url: '/api/purchaseRequests/all',
            data: {
                where: {
                    active: true,
                    approved: true,
                    hasTransaction: false,
                },
                select: {
                    id: 1,
                    code: 1,
                    title: 1,
                    approved: 1,
                    hasTransaction: 1,
                    active: 1,
                    itemsList: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.purchaseRequestList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.resetItemsList = function () {
        alert();
        $scope.item.itemsList = [];
    };

    $scope.addToItemsList = function (orderItem) {
        $scope.itemListError = '';
        if (!orderItem.item) {
            $scope.itemListError = '##word.Please Enter Item##';
            return;
        }
        if (!orderItem?.unit.id) {
            $scope.itemListError = '##word.Please Enter Item Unit##';
            return;
        }
        if (!orderItem.purchaseCount > 0) {
            $scope.itemListError = '##word.Please Enter Count##';
            return;
        }
        if (!orderItem.purchasePrice > 0) {
            $scope.itemListError = '##word.Please Enter Price##';
            return;
        }

        $scope.item.itemsList.unshift({
            item: orderItem.item,
            unit: orderItem.unit,
            purchaseCount: orderItem.purchaseCount,
            purchasePrice: orderItem.purchasePrice,
            bonusPrice: orderItem.bonusPrice,
            bonusCount: orderItem.bonusCount,
            total: orderItem.purchaseCount * orderItem.purchasePrice,
            approved: orderItem.approved,
            purchaseCost: 0,
        });
        $scope.orderItem = { ...$scope, orderItem };
        $scope.itemListError = '';
    };

    $scope.getRequestItems = function (purchaseRequest) {
        $scope.item.itemsList = [];
        for (const elem of purchaseRequest.itemsList) {
            $scope.item.itemsList.push({
                item: elem.item,
                unit: elem.unit,
                purchaseCount: elem.purchaseCount,
                purchasePrice: 0,
                bonusCount: 0,
                bonusPrice: 0,
                purchaseCost: 0,
                discount: 0,
                total: 0,
            });
        }
    };

    $scope.approveItem = function (item) {
        if (!item.purchasePrice > 0) {
            $scope.itemListError = '##word.Please Enter Price##';
            return;
        }
        if (item.purchaseCount < 1) {
            $scope.itemListError = '##word.Please Enter Count##';
            return;
        }

        $scope.item.itemsList.some((elem) => {
            if (elem.item == item.item) {
                elem.approved = true;
            }
        });
        $scope.prpepareToApproveOrder($scope.item);
        $scope.itemListError = '';
    };

    $scope.unapproveItem = function (item) {
        $scope.item.itemsList.forEach((elem) => {
            if (elem.item == item.item) {
                elem.approved = false;
                $scope.canApprove = false;
            }
        });
    };

    $scope.calculateTotalInItemsList = function (itm) {
        if (itm.purchaseCount < 0 || itm.purchasePrice < 0) {
            $scope.itemListError = '##word.Please Enter Valid Numbers##';
            return;
        }
        $scope.item.itemsList.some((elem) => {
            if (elem.item.id === itm.item.id && elem.unit.id === itm.unit.id) {
                elem.total = elem.purchaseCount * elem.purchasePrice;
            }
        });
        $scope.itemListError = '';
    };

    $scope.prpepareToApproveOrder = function (_item) {
        _item.itemsList.every((elem) => {
            if (elem.approved) {
                return ($scope.canApprove = true);
            }
            $scope.canApprove = false;
        });
    };

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
        $scope.itemListError = '';
        $scope.error = '';
        let success = false;
        if (!_item.itemsList.length) {
            $scope.itemListError = '##word.Must Enter Items Data##';
            return success;
        }
        if (_item.calculatePurchaseCost) {
            if (!_item.calculatePurchaseCostType) {
                alert('##word.Please Select Calculate Purchase Cost Type##');
                return success;
            }
            if (!_item.purchaseCost > 0) {
                alert('##word.Please Enter Calculate Purchase Cost##');
                return success;
            }
        }
        success = true;
        return { success, _item };
    };

    $scope.getAll();
    $scope.getPaymentTypes();
    $scope.getpurchaseOrdersSource();
    $scope.getVendors();
    $scope.getStores();
    $scope.getStoresItems();
    $scope.getNumberingAuto();
});