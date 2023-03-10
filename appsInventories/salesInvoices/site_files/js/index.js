app.controller('salesInvoices', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'salesInvoices';
    $scope.modalID = '#salesInvoicesManageModal';
    $scope.modalSearchID = '#salesInvoicesSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: { url: '/images/salesInvoices.png' },
        totalPrice: 0,
        totalItemsDiscounts: 0,
        totalDiscounts: 0,
        totalTaxes: 0,
        totalBeforeVat: 0,
        totalVat: 0,
        totalAfterVat: 0,
        totalNet: 0,
        active: true,
    };
    $scope.item = {};
    $scope.orderItem = {};
    $scope.list = [];

    $scope.resetOrderItem = function () {
        $scope.orderItem = {
            count: 1,
            barcode: '',
            price: 0,
            extraDiscount: 0,
            discount: 0,
            maxDiscount: 0,
            discountType: '',
            total: 0,
        };
    };
    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.mainError = '';

        if (!$scope.settings || !$scope.settings.id) {
            $scope.mainError = '##word.Please Contact System Administrator to Set System Setting##';
            return;
        }
        $scope.itemsError = '';
        $scope.mode = 'add';
        $scope.resetOrderItem();
        $scope.item = { ...$scope.structure, date: new Date(), itemsList: [], discountsList: [], taxesList: [] };
        if ($scope.settings.storesSetting.paymentType && $scope.settings.storesSetting.paymentType.id) {
            $scope.item.paymentType = $scope.paymentTypesList.find((_t) => {
                return _t.id == $scope.settings.storesSetting.paymentType.id;
            });
        }

        if ($scope.settings.storesSetting.store && $scope.settings.storesSetting.store.id) {
            $scope.item.store = $scope.storesList.find((_t) => {
                return _t.id == $scope.settings.storesSetting.store.id;
            });
        }

        /*   if ($scope.settings.storesSetting.customer && $scope.settings.storesSetting.customer.id) {
      $scope.item.customer = $scope.customersList.find((_t) => {
        return _t.id == $scope.settings.storesSetting.customer.id;
      });
    } */
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
                    if ($scope.settings.accountsSetting.currency) {
                        site.strings['currency'] = {
                            ar: ' ' + $scope.settings.accountsSetting.currency.nameAr + ' ',
                            en: ' ' + $scope.settings.accountsSetting.currency.nameEn + ' ',
                        };
                        site.strings['from100'] = {
                            ar: ' ' + $scope.settings.accountsSetting.currency.smallCurrencyAr + ' ',
                            en: ' ' + $scope.settings.accountsSetting.currency.smallCurrencyEn + ' ',
                        };
                    }
                    $scope.item.netTxt = site.stringfiy($scope.item.totalNet);
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

    $scope.getCustomers = function ($search) {
        if ($search && $search.length < 1) {
            return;
        }
        $scope.busy = true;
        $scope.customersList = [];
        $http({
            method: 'POST',
            url: '/api/customers/all',
            data: {
                where: {
                    active: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    taxIdentificationNumber: 1,
                    mobile: 1,
                },
                search: $search,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.customersList = response.data.list;
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
                barcode: elem.barcode,
                code: elem.unit.code,
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
                price: elem.salesPrice,
                maxDiscount: elem.maxDiscount,
                discount: elem.discount,
                discountType: elem.discountType,
                storesList: elem.storesList,
            });
            $scope.orderItem.unit = $scope.unitsList[0];
        }
    };

    $scope.addToItemsList = function (orderItem) {
        $scope.itemsError = '';
        if (!orderItem.item || !orderItem.item?.id) {
            $scope.itemsError = '##word.Please Enter Item##';
            return;
        }

        if (!orderItem.unit || !orderItem.unit.id) {
            $scope.itemsError = '##word.Please Enter Item Unit##';
            return;
        }

        if (!orderItem.count > 0) {
            $scope.itemsError = '##word.Please Enter Count##';
            return;
        }
        let item = {
            id: orderItem.item.id,
            code: orderItem.item.code,
            nameAr: orderItem.item.nameAr,
            nameEn: orderItem.item.nameEn,
            itemGroup: orderItem.item.itemGroup,
            barcode: orderItem.unit.barcode,
            unit: { id: orderItem.unit.id, code: orderItem.unit.code, nameAr: orderItem.unit.nameAr, nameEn: orderItem.unit.nameEn },
            count: orderItem.count,
            price: orderItem.unit.price,
            noVat: orderItem.item.noVat,
            discount: orderItem.unit.discount,
            maxDiscount: orderItem.unit.maxDiscount,
            discountType: orderItem.unit.discountType,
        };
        if (orderItem.item.workByBatch || orderItem.item.workBySerial) {
            item.workByBatch = orderItem.item.workByBatch;
            item.workBySerial = orderItem.item.workBySerial;
            item.validityDays = orderItem.item.validityDays;
            item.batchesList = [];
            orderItem.unit.storesList = orderItem.unit.storesList || [];
            let unitStore = orderItem.unit.storesList.find((_s) => {
                return _s.store.id === $scope.item.store.id;
            });
            if (unitStore) {
                unitStore.batchesList = unitStore.batchesList || [];
                unitStore.batchesList.forEach((_b) => {
                    if (_b.count > 0) {
                        if (_b.count > 0) {
                            let batch = { ..._b };
                            batch.currentCount = batch.count;
                            batch.count = 0;
                            item.batchesList.push(batch);
                        }
                    }
                });
            }
        }
        let index = $scope.item.itemsList.findIndex((_item) => _item.id === item.id && _item.unit.id == item.unit.id);
        if (index == -1) {
            $scope.item.itemsList.unshift(item);
        } else {
            $scope.item.itemsList[index].count += 1;
        }
        $scope.calculate($scope.item);
        $scope.resetOrderItem();
        $scope.itemsError = '';
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
    $scope.getDiscountTypes = function () {
        $scope.busy = true;
        $scope.discountTypesList = [];
        $http({
            method: 'POST',
            url: '/api/discountTypes/all',
            data: {
                where: {
                    active: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameAr: 1,
                    nameEn: 1,
                    discountValue: 1,
                    discountType: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.discountTypesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.addToList = function (discount, type) {
        if (discount && discount.id) {
            if (type === 'discount') {
                $scope.item.discountsList.unshift({
                    id: discount.id,
                    code: discount.code,
                    nameAr: discount.nameAr,
                    nameEn: discount.nameEn,
                    value: discount.discountValue,
                    type: discount.discountType,
                });
                $scope.item.totalDiscounts += discount.discountValue;
                $scope.discount = {};
            }
            if (type === 'tax') {
                $scope.item.taxesList.unshift({
                    id: discount.id,
                    code: discount.code,
                    nameAr: discount.nameAr,
                    nameEn: discount.nameEn,
                    value: discount.value,
                });
                $scope.item.totalTaxes += discount.value;
                $scope.tax = {};
            }
        }
        $scope.calculate($scope.item);
    };

    $scope.spliceFromList = function (discount, type) {
        if (type === 'discount') {
            const index = $scope.item.discountsList.findIndex((dis) => dis.id === discount.id);
            if (index !== -1) {
                $scope.item.discountsList.splice(index, 1);
                $scope.item.totalDiscounts -= discount.value;
            }
        }

        if (type === 'tax') {
            const index = $scope.item.taxesList.findIndex((dis) => dis.id === discount.id);
            if (index !== -1) {
                $scope.item.taxesList.splice(index, 1);
                $scope.item.totalTaxes -= discount.value;
            }
        }
        $scope.calculate($scope.item);
    };

    $scope.getTaxTypes = function () {
        $scope.busy = true;
        $scope.taxTypesList = [];
        $http({
            method: 'POST',
            url: '/api/taxesTypes/all',
            data: {
                where: {
                    active: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameAr: 1,
                    nameEn: 1,
                    value: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.taxTypesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.setTotalPrice = function () {
        $scope.item.totalPrice = 0;
        $scope.item.itemsList.forEach((_item) => {
            $scope.item.totalPrice += _item.price * _item.count;
        });
    };

    $scope.getBarcode = function (ev) {
        $scope.error = '';
        let where = {
            active: true,
            allowSale: true,
        };
        if (!$scope.item.store || !$scope.item.store.id) {
            $scope.error = '##word.Please Select Store';
            return;
        }
        if (ev && ev.which != 13) {
            return;
        }

        where['unitsList.barcode'] = $scope.orderItem.barcode;

        $scope.busy = true;
        $scope.itemsList = [];
        $http({
            method: 'POST',
            url: '/api/storesItems/all',
            data: {
                storeId: $scope.item.store.id,
                where: where,
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    noVat: 1,
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
                    $scope.itemsList = response.data.list;
                    if ($scope.itemsList && $scope.itemsList.length == 1) {
                        let _unit = $scope.itemsList[0].unitsList.find((_u) => {
                            return _u.barcode == $scope.orderItem.barcode;
                        });
                        $scope.addToItemsList({
                            item: $scope.itemsList[0],
                            unit: {
                                id: _unit.unit.id,
                                barcode: _unit.barcode,
                                code: _unit.unit.code,
                                nameEn: _unit.unit.nameEn,
                                nameAr: _unit.unit.nameAr,
                                price: _unit.salesPrice,
                                maxDiscount: _unit.maxDiscount,
                                discount: _unit.discount,
                                extraDiscount: _unit.extraDiscount,
                                discountType: _unit.discountType,
                                storesList: _unit.storesList,
                            },
                            count: 1,
                        });
                    }
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
        $scope.itemsList = [];
        $http({
            method: 'POST',
            url: '/api/storesItems/all',
            data: {
                storeId: $scope.item.store.id,
                where: {
                    active: true,
                    allowSale: true,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    noVat: 1,
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
                    $scope.itemsList = response.data.list;
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

    $scope.getSetting = function () {
        $scope.busy = true;
        $scope.settings = {};
        $http({
            method: 'POST',
            url: '/api/systemSetting/get',
            data: {},
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    $scope.settings = response.data.doc;
                    if ($scope.settings.printerProgram.invoiceLogo) {
                        $scope.invoiceLogo = document.location.origin + $scope.settings.printerProgram.invoiceLogo.url;
                    }
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.calculate = function (obj) {
        $timeout(() => {
            obj.totalPrice = 0;
            obj.totalVat = 0;
            obj.totalAfterVat = 0;
            obj.totalBeforeVat = 0;
            obj.totalDiscounts = 0;
            obj.totalItemsDiscounts = 0;
            obj.totalTaxes = 0;
            obj.totalNet = 0;

            obj.itemsList.forEach((item) => {
                let discountValue = 0;
                item.totalVat = 0;
                item.newPrice = 0;
                discountValue = item.discountType === 'value' ? item.discount : (item.price * item.discount) / 100;
                item.totalDiscount = discountValue * item.count;
                item.totalDiscount = site.toNumber(item.totalDiscount);
                item.totalExtraDiscount = (item.totalPrice * item.extraDiscount) / 100;
                item.totalExtraDiscount = site.toNumber(item.totalExtraDiscount);
                obj.totalItemsDiscounts += item.totalDiscount + item.totalExtraDiscount;
                item.totalPrice = item.price * item.count;
                obj.totalPrice += item.totalPrice;
                if (!item.noVat) {
                    item.vat = $scope.settings.storesSetting.vat;
                    item.totalVat = (((item.price - discountValue) * item.vat) / 100) * item.count;
                    item.totalVat = site.toNumber(item.totalVat);
                } else {
                    item.vat = 0;
                }
                item.newPrice = item.price - discountValue + item.totalVat;
                item.newPrice = site.toNumber(item.newPrice);
                item.vat = site.toNumber(item.vat);
                item.totalVat = site.toNumber(item.totalVat);
                obj.totalVat += item.totalVat;
                item.total = item.totalPrice + item.totalVat - (item.totalDiscount + item.totalExtraDiscount);
                item.total = site.toNumber(item.total);
                item.totalBeforeVat = item.totalPrice - (item.totalDiscount + item.totalExtraDiscount);
                obj.totalBeforeVat += item.totalBeforeVat;
                obj.totalAfterVat += item.total;
            });

            obj.discountsList.forEach((d) => {
                if (d.type == 'value') {
                    obj.totalDiscounts += d.value;
                } else if (d.type == 'percent') {
                    obj.totalDiscounts += (obj.totalAfterVat * d.value) / 100;
                }
            });

            obj.taxesList.forEach((t) => {
                obj.totalTaxes += (obj.totalAfterVat * t.value) / 100;
            });

            obj.totalItemsDiscounts = site.toNumber(obj.totalItemsDiscounts);
            obj.totalTaxes = site.toNumber(obj.totalTaxes);
            obj.totalDiscounts = site.toNumber(obj.totalDiscounts);
            obj.totalBeforeVat = site.toNumber(obj.totalBeforeVat);
            obj.totalAfterVat = site.toNumber(obj.totalAfterVat);
            obj.totalNet = obj.totalAfterVat - obj.totalDiscounts + obj.totalTaxes;
            obj.totalNet = site.toNumber(obj.totalNet);
        }, 300);

        $scope.itemsError = '';
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

    $scope.saveBatch = function (item) {
        $scope.errorBatch = '';
        $scope.error = '';

        if (item.batchesList.some((b) => b.count > b.currentCount)) {
            $scope.errorBatch = '##word.New quantity cannot be greater than current quantity##';
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
        $scope.calcBatch(item);
        site.showModal('#batchModalModal');
    };

    $scope.calcBatch = function (item) {
        $timeout(() => {
            $scope.errorBatch = '';
            $scope.error = '';
            item.$batchCount = item.batchesList.length > 0 ? item.batchesList.reduce((a, b) => +a + +b.count, 0) : 0;
        }, 250);
    };

    $scope.thermalPrint = function (obj) {
        $scope.error = '';
        if ($scope.busy) return;
        $scope.busy = true;
        if ($scope.settings.printerProgram.thermalPrinter) {
            $('#thermalPrint').removeClass('hidden');
            $scope.thermal = { ...obj };

            $scope.localPrint = function () {
                if ($scope.settings.printerProgram.placeQr) {
                    if ($scope.settings.printerProgram.placeQr.id == 1) {
                        site.qrcode({
                            width: 140,
                            height: 140,
                            selector: document.querySelector('.qrcode'),
                            text: document.location.protocol + '//' + document.location.hostname + `/qr_storeout?id=${$scope.thermal.id}`,
                        });
                    } else if ($scope.settings.printerProgram.placeQr.id == 2) {
                        if ($scope.settings.printerProgram.countryQr && $scope.settings.printerProgram.countryQr.id == 1) {
                            let qrString = {
                                vatNumber: '##session.company.taxNumber##',
                                time: new Date($scope.thermal.date).toISOString(),
                                total: $scope.thermal.totalNet,
                                totalVat: $scope.thermal.totalVat,
                            };
                            if ($scope.settings.printerProgram.thermalLang.id == 1 || ($scope.settings.printerProgram.thermalLang.id == 3 && '##session.lang##' == 'Ar')) {
                                qrString.name = '##session.company.nameAr##';
                            } else if ($scope.settings.printerProgram.thermalLang.id == 2 || ($scope.settings.printerProgram.thermalLang.id == 3 && '##session.lang##' == 'En')) {
                                qrString.name = '##session.company.nameEn##';
                            }
                            qrString.name = '##session.company.nameEn##';
                            site.zakat2(
                                {
                                    name: qrString.name,
                                    vatNumber: qrString.vatNumber,
                                    time: qrString.time,
                                    total: qrString.total.toString(),
                                    totalVat: qrString.totalVat.toString(),
                                },
                                (data) => {
                                    site.qrcode({ width: 140, height: 140, selector: document.querySelector('.qrcode'), text: data.value });
                                }
                            );
                        } else {
                            let datetime = new Date($scope.thermal.date);
                            let formattedDate =
                                datetime.getFullYear() +
                                '-' +
                                (datetime.getMonth() + 1) +
                                '-' +
                                datetime.getDate() +
                                ' ' +
                                datetime.getHours() +
                                ':' +
                                datetime.getMinutes() +
                                ':' +
                                datetime.getSeconds();
                            let qrString = `[${'##session.company.nameAr##'}]\n?????? ?????????? : [${$scope.settings.printerProgram.taxNumber}]\n?????? ???????????????? :[${
                                $scope.thermal.code
                            }]\n?????????? : [${formattedDate}]\n?????????? ???????????? ?????????????? : [${$scope.thermal.totalVat}]\n???????????? : [${$scope.thermal.totalNet}]`;
                            site.qrcode({ width: 140, height: 140, selector: document.querySelector('.qrcode'), text: qrString });
                        }
                    }
                }
                let printer = $scope.settings.printerProgram.thermalPrinter;
                if ('##user.printerPath##' && '##.printerPath.id##' > 0) {
                    printer = JSON.parse('##user.printerPath##');
                }
                $timeout(() => {
                    site.print({
                        selector: '#thermalPrint',
                        ip: printer.ipDevice,
                        port: printer.portDevice,
                        pageSize: 'Letter',
                        printer: printer.ip.name.trim(),
                    });
                }, 500);
            };

            $scope.localPrint();
        } else {
            $scope.error = '##word.thermal_printer_must_select##';
        }
        $scope.busy = false;
        $timeout(() => {
            $('#thermalPrint').addClass('hidden');
        }, 8000);
    };

    $scope.print = function (type) {
        $scope.error = '';
        if ($scope.busy) return;
        $scope.busy = true;
        $('#salesInvoicesDetails').removeClass('hidden');

        if ($scope.item.itemsList.length > $scope.settings.printerProgram.itemsCountA4) {
            $scope.invList = [];
            let invLength = $scope.item.itemsList.length / $scope.settings.printerProgram.itemsCountA4;
            invLength = parseInt(invLength);
            let ramainItems = $scope.item.itemsList.length - invLength * $scope.settings.printerProgram.itemsCountA4;

            if (ramainItems) {
                invLength += 1;
            }

            for (let iInv = 0; iInv < invLength; iInv++) {
                let so = { ...$scope.item };

                so.itemsList = [];
                $scope.item.itemsList.forEach((itm, i) => {
                    let item = { ...itm };
                    item.$index = i + 1;
                    if (i < (iInv + 1) * $scope.settings.printerProgram.itemsCountA4 && !item.$doneInv) {
                        item.$doneInv = true;
                        so.itemsList.push(item);
                    }
                });
                $scope.invList.push(so);
            }
        } else {
            $scope.item.itemsList.forEach((_item, i) => {
                _item.$index = i + 1;
            });

            $scope.invList = [{ ...$scope.item }];
        }

        $scope.localPrint = function () {
            if (document.querySelectorAll('.qrcode-a4').length !== $scope.invList.length) {
                $timeout(() => {
                    $scope.localPrint();
                }, 300);
                return;
            }

            if ($scope.settings.printerProgram.placeQr) {
                if ($scope.settings.printerProgram.placeQr.id == 1) {
                    site.qrcode({
                        width: 140,
                        height: 140,
                        selector: document.querySelectorAll('.qrcode-a4')[$scope.invList.length - 1],
                        text: document.location.protocol + '//' + document.location.hostname + `/qr_storeout?id=${$scope.item.id}`,
                    });
                } else if ($scope.settings.printerProgram.placeQr.id == 2) {
                    if ($scope.settings.printerProgram.countryQr && $scope.settings.printerProgram.countryQr.id == 1) {
                        let qrString = {
                            vatNumber: '##session.company.taxNumber##',
                            time: new Date($scope.item.date).toISOString(),
                            total: $scope.item.totalNet,
                            totalVat: $scope.item.totalVat,
                        };
                        if ($scope.settings.printerProgram.thermalLang.id == 1 || ($scope.settings.printerProgram.thermalLang.id == 3 && '##session.lang##' == 'Ar')) {
                            qrString.name = '##session.company.nameAr##';
                        } else if ($scope.settings.printerProgram.thermalLang.id == 2 || ($scope.settings.printerProgram.thermalLang.id == 3 && '##session.lang##' == 'En')) {
                            qrString.name = '##session.company.nameEn##';
                        }
                        qrString.name = '##session.company.nameEn##';
                        site.zakat2(
                            {
                                name: qrString.name,
                                vatNumber: qrString.vatNumber,
                                time: qrString.time,
                                total: qrString.total.toString(),
                                totalVat: qrString.totalVat.toString(),
                            },
                            (data) => {
                                site.qrcode({ width: 140, height: 140, selector: document.querySelectorAll('.qrcode-a4')[$scope.invList.length - 1], text: data.value });
                            }
                        );
                    } else {
                        let datetime = new Date($scope.item.date);
                        let formattedDate =
                            datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds();
                        let qrString = `[${'##session.company.nameAr##'}]\n?????? ?????????? : [${$scope.settings.printerProgram.taxNumber}]\n?????? ???????????????? :[${
                            $scope.item.code
                        }]\n?????????? : [${formattedDate}]\n?????????? ???????????? ?????????????? : [${$scope.item.totalVat}]\n???????????? : [${$scope.item.totalNet}]`;

                        site.qrcode({ width: 150, height: 150, selector: document.querySelectorAll('.qrcode-a4')[$scope.invList.length - 1], text: qrString });
                    }
                }
            }
            let printer = {};
            if (type == 'a4') {
                if ($scope.settings.printerProgram.a4Printer) {
                    printer = $scope.settings.printerProgram.a4Printer;
                } else {
                    $scope.error = '##word.A4 printer must select##';
                    return;
                }
                if ('##user.printerPath##' && '##user.printerPath.id##' > 0) {
                    printer = JSON.parse('##user.printerPath##');
                }
            } else if (type === 'pdf') {
                if ($scope.settings.printerProgram.pdfPrinter) {
                    printer = $scope.settings.printerProgram.pdfPrinter;
                } else {
                    $scope.error = '##word.PDF printer must select##';
                    return;
                }
            }

            $timeout(() => {
                site.print({
                    selector: '#salesInvoicesDetails',
                    ip: printer.ipDevice,
                    port: printer.portDevice,
                    pageSize: 'A4',
                    printer: printer.ip.name.trim(),
                });
            }, 500);
        };

        $scope.localPrint();

        $scope.busy = false;
        $timeout(() => {
            $('#salesInvoicesDetails').addClass('hidden');
        }, 8000);
    };

    $scope.getAll();
    $scope.getPaymentTypes();
    $scope.getDiscountTypes();
    $scope.getTaxTypes();
    $scope.getStores();
    $scope.getCustomers();
    $scope.getStoresItems();
    $scope.getNumberingAuto();
    $scope.getSetting();
});
