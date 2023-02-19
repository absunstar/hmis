app.controller('storesOpeningBalances', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'storesOpeningBalances';
    $scope.modalID = '#storesOpeningBalancesManageModal';
    $scope.modalSearchID = '#storesOpeningBalancesSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: { url: '/images/storesOpeningBalances.png' },
        importPermitNumber: 0,
        totalPrice: 0,
        totalDiscounts: 0,
        totalTaxes: 0,
        totalVendorDiscounts: 0,
        hasVendor: true,
        approved: false,
        purchaseCost: 0,
        active: true,
    };
    $scope.item = {};
    $scope.discount = {};
    $scope.tax = {};
    $scope.list = [];
    $scope.orderItem = {
        count: 1,
        price: 0,
        bonusCount: 0,
        salesPrice: 0,
        vendorDiscount: 0,
        bonusPrice: 0,
        vat: 0,
        total: 0,
        approved: false,
    };
    $scope.canApprove = false;
    $scope.resetOrderItem = function () {
        $scope.orderItem = {
            count: 1,
            price: 0,
            salesPrice: 0,
            bonusCount: 0,
            bonusPrice: 0,
            vendorDiscount: 0,
            vat: 0,
            total: 0,
            approved: false,
        };
    };

    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.itemsError = '';
        $scope.mode = 'add';
        $scope.item = { ...$scope.structure, orderDate: new Date(), filesList: [], itemsList: [] };
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

    $scope.getAll = function () {
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

    // $scope.getstoresOpeningBalancesSource = function () {
    //     $scope.busy = true;
    //     $scope.storesOpeningBalancesSourcesList = [];
    //     $http({
    //         method: 'POST',
    //         url: '/api/storesOpeningBalancesSource',
    //         data: {
    //             select: {
    //                 id: 1,
    //                 code: 1,
    //                 nameEn: 1,
    //                 nameAr: 1,
    //             },
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done && response.data.list.length > 0) {
    //                 $scope.storesOpeningBalancesSourcesList = response.data.list;
    //             }
    //         },
    //         function (err) {
    //             $scope.busy = false;
    //             $scope.error = err;
    //         }
    //     );
    // };

    // $scope.getPaymentTypes = function () {
    //     $scope.busy = true;
    //     $scope.paymentTypesList = [];
    //     $http({
    //         method: 'POST',
    //         url: '/api/paymentTypes',
    //         data: {
    //             select: {
    //                 id: 1,
    //                 code: 1,
    //                 nameEn: 1,
    //                 nameAr: 1,
    //             },
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done && response.data.list.length > 0) {
    //                 $scope.paymentTypesList = response.data.list;
    //             }
    //         },
    //         function (err) {
    //             $scope.busy = false;
    //             $scope.error = err;
    //         }
    //     );
    // };

    $scope.getVendors = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }
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
                search: $search,
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

    // $scope.getDiscountTypes = function ($search) {
    //     if ($search && $search.length < 3) {
    //         return;
    //     }
    //     $scope.busy = true;
    //     $scope.discountTypesList = [];
    //     $http({
    //         method: 'POST',
    //         url: '/api/discountTypes/all',
    //         data: {
    //             where: {
    //                 active: true,
    //             },
    //             select: {
    //                 id: 1,
    //                 code: 1,
    //                 nameAr: 1,
    //                 nameEn: 1,
    //                 discountValue: 1,
    //                 discountType: 1,
    //             },
    //             search: $search,
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done && response.data.list.length > 0) {
    //                 $scope.discountTypesList = response.data.list;
    //             }
    //         },
    //         function (err) {
    //             $scope.busy = false;
    //             $scope.error = err;
    //         }
    //     );
    // };

    // $scope.addToList = function (discount, type) {
    //     if (type === 'discount') {
    //         $scope.item.discountsList.unshift({
    //             id: discount.id,
    //             code: discount.code,
    //             nameAr: discount.nameAr,
    //             nameEn: discount.nameEn,
    //             value: discount.discountValue,
    //             type: discount.discountType,
    //         });
    //         $scope.item.totalDiscounts += discount.discountValue;
    //         $scope.discount = {};
    //     }
    //     if (type === 'tax') {
    //         $scope.item.taxesList.unshift({
    //             id: discount.id,
    //             code: discount.code,
    //             nameAr: discount.nameAr,
    //             nameEn: discount.nameEn,
    //             value: discount.value,
    //         });
    //         $scope.item.totalTaxes += discount.value;
    //         $scope.tax = {};
    //     }
    // };

    // $scope.spliceFromList = function (discount, type) {
    //     if (type === 'discount') {
    //         const index = $scope.item.discountsList.findIndex((dis) => dis.id === discount.id);
    //         if (index !== -1) {
    //             $scope.item.discountsList.splice(index, 1);
    //             $scope.item.totalDiscounts -= discount.value;
    //         }
    //     }

    //     if (type === 'tax') {
    //         const index = $scope.item.taxesList.findIndex((dis) => dis.id === discount.id);
    //         if (index !== -1) {
    //             $scope.item.taxesList.splice(index, 1);
    //             $scope.item.totalTaxes -= discount.value;
    //         }
    //     }
    // };

    // $scope.getTaxTypes = function ($search) {
    //     if ($search && $search.length < 3) {
    //         return;
    //     }
    //     $scope.busy = true;
    //     $scope.taxTypesList = [];
    //     $http({
    //         method: 'POST',
    //         url: '/api/taxesTypes/all',
    //         data: {
    //             where: {
    //                 active: true,
    //             },
    //             select: {
    //                 id: 1,
    //                 code: 1,
    //                 nameAr: 1,
    //                 nameEn: 1,
    //                 value: 1,
    //             },
    //             search: $search,
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done && response.data.list.length > 0) {
    //                 $scope.taxTypesList = response.data.list;
    //             }
    //         },
    //         function (err) {
    //             $scope.busy = false;
    //             $scope.error = err;
    //         }
    //     );
    // };

    $scope.setTotalPrice = function () {
        $scope.item.totalPrice = 0;
        $scope.item.itemsList.forEach((_item) => {
            $scope.item.totalPrice += _item.price * _item.count;
        });
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
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
                storesList: elem.storesList,
                price: elem.purchasePrice,
                salesPrice: elem.salesPrice,
            });
        }
        $scope.orderItem.unit = $scope.unitsList[0];
        $scope.orderItem.price = $scope.unitsList[0].price;
        $scope.orderItem.salesPrice = $scope.unitsList[0].salesPrice;
    };

    $scope.setOrderItemData = function (unit) {
        $scope.orderItem.unit = { id: unit.id, code: unit.code, nameAr: unit.nameAr, nameEn: unit.nameEn };
        $scope.orderItem.price = unit.price;
        $scope.orderItem.salesPrice = unit.salesPrice;
    };

    // $scope.getPurchaseRequest = function () {
    //     $scope.busy = true;
    //     $scope.purchaseRequestList = [];
    //     $scope.item.itemsList = [];
    //     $http({
    //         method: 'POST',
    //         url: '/api/purchaseRequests/all',
    //         data: {
    //             where: {
    //                 active: true,
    //                 approved: true,
    //                 hasTransaction: false,
    //             },
    //             select: {
    //                 id: 1,
    //                 code: 1,
    //                 title: 1,
    //                 approved: 1,
    //                 hasTransaction: 1,
    //                 active: 1,
    //                 itemsList: 1,
    //             },
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done && response.data.list.length > 0) {
    //                 $scope.purchaseRequestList = response.data.list;
    //             }
    //         },
    //         function (err) {
    //             $scope.busy = false;
    //             $scope.error = err;
    //         }
    //     );
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
        if (!orderItem.count > 0) {
            alert('##word.Please Enter Count##');
            return;
        }
        if (!orderItem.price > 0) {
            alert('##word.Please Enter Price##');
            return;
        }

        delete orderItem.unit.storesList;

        $scope.item.itemsList.unshift({
            id: orderItem.item.id,
            code: orderItem.item.code,
            nameAr: orderItem.item.nameAr,
            nameEn: orderItem.item.nameEn,
            itemGroup: orderItem.item.itemGroup,
            unit: orderItem.unit,
            count: orderItem.count,
            price: orderItem.price,
            salesPrice: orderItem.salesPrice,
            bonusPrice: orderItem.bonusPrice,
            bonusCount: orderItem.bonusCount,
            total: orderItem.count * orderItem.price,
            approved: orderItem.approved,
            vendorDiscount: orderItem.vendorDiscount,
            purchaseCost: 0,
            approved: false,
        });
        delete orderItem.price;
        delete orderItem.salesPrice;

        $scope.setTotalPrice();
        $scope.orderItem = { ...$scope, orderItem };
        $scope.itemsError = '';
    };

    $scope.getRequestItems = function (purchaseRequest) {
        $scope.item.itemsList = [];
        for (const elem of purchaseRequest.itemsList) {
            $scope.item.itemsList.push({
                id: elem.id,
                code: elem.code,
                nameAr: elem.nameAr,
                nameEn: elem.nameEn,
                itemGroup: elem.itemGroup,
                unit: elem.unit,
                requestedCount: elem.count,
                count: elem.count,
                price: elem.price,
                salesPrice: elem.salesPrice,
                bonusCount: 0,
                bonusPrice: 0,
                purchaseCost: 0,
                discount: 0,
                vendorDiscount: 0,
                total: 0,
                approved: false,
            });
            $scope.calculateTotalInItemsList($scope.item.itemsList[$scope.item.itemsList.length - 1]);
        }
    };

    $scope.approveItem = function (item) {
        if (!item.price > 0) {
            $scope.itemsError = '##word.Please Enter Price##';
            return;
        }
        if (item.count < 1) {
            $scope.itemsError = '##word.Please Enter Count##';
            return;
        }
        const index = $scope.item.itemsList.findIndex((_elem) => _elem.id === item.id && _elem.unit.id === item.unit.id);
        if (index !== -1) {
            $scope.item.itemsList[index].approved = true;
        }
        $scope.prpepareToApproveOrder($scope.item);
        $scope.itemsError = '';
    };

    $scope.unapproveItem = function (item) {
        const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === item.id && _elm.unit.id === item.unit.id);
        if (itemIndex !== -1) {
            $scope.item.itemsList[itemIndex].approved = false;
            $scope.canApprove = false;
        }
    };

    $scope.calculateTotalInItemsList = function (itm) {
        $timeout(() => {
            if (itm.count < 0 || itm.price < 0) {
                $scope.itemsError = '##word.Please Enter Valid Numbers##';
                return;
            }
            const itemIndex = $scope.item.itemsList.findIndex((_elm) => _elm.id === itm.id && _elm.unit.id === itm.unit.id);
            const selectdItem = $scope.item.itemsList[itemIndex];
            if (itemIndex !== -1) {
                selectdItem.total = selectdItem.count * selectdItem.price;
                $scope.setTotalPrice();
            }
            $scope.itemsError = '';
        }, 300);
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
    // $scope.getPaymentTypes();
    // $scope.getstoresOpeningBalancesSource();
    // $scope.getDiscountTypes();
    $scope.getVendors();
    $scope.getStores();
    // $scope.getTaxTypes();
    $scope.getStoresItems();
    $scope.getNumberingAuto();
});
