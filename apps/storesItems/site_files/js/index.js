app.controller('storesItems', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'storesItems';
    $scope.modalID = '#storesItemsManageModal';
    $scope.modalSearchID = '#storesItemsSearchModal';
    $scope.modalStoreData = '#modalStoreItemStoreDataModal';
    $scope.modalUnitConversionData = '#unitConversionModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: { url: '/images/storesItems.png' },
        active: true,
    };
    $scope.item = {};
    $scope.list = [];

    $scope.collectedItem = {
        item: {},
        unit: {},
        quantity: 1,
    };

    $scope.resetItemUnit = function () {
        $scope.itemUnit = {
            conversion: 1,
            barcode: '',
            purchaseCost: 0,
            purchasePrice: 0,
            salesPrice: 0,
            averageCost: 0,
            discount: 0,
            maxDiscount: 0,
            discountType: 'value',
            storesList: [],
            active: true,
        };
    };

    $scope.resetSubstance = function () {
        $scope.substance = {
            concentration: 0,
        };
    };

    $scope.resetCollectedItem = function () {
        $scope.substance = {
            concentration: 0,
        };
    };

    $scope.collectedItemUnits = [];

    $scope.showAdd = function (_item) {
        $scope.error = '';
        if (!$scope.settings || !$scope.settings.id) {
            return;
        }
        $scope.mode = 'add';
        $scope.item = {
            ...$scope.structure,
            allowSale: true,
            allowBuy: true,
            workByBatch: true,
            unitsList: [],
            workBySerial: false,
            showOnTouchScreen: false,
            collectionItem: false,
            noVat: false,
            autoPurchasePriceCalculation: true,
            validityDays: 0,
            reorderLimit: 0,
        };
        if ($scope.settings.storesSetting.itemType && $scope.settings.storesSetting.itemType.id) {
            $scope.item.itemType = $scope.itemsTypesList.find((_t) => {
                return _t.id == $scope.settings.storesSetting.itemType.id;
            });
        }

        if ($scope.settings.storesSetting.itemGroup && $scope.settings.storesSetting.itemGroup.id) {
            $scope.item.itemGroup = $scope.itemsgroupsList.find((_g) => {
                return _g.id == $scope.settings.storesSetting.itemGroup.id;
            });
        }

        if ($scope.settings.storesSetting.itemUnit && $scope.settings.storesSetting.itemUnit.id) {
            $scope.item.mainUnit = $scope.storesUnitsList.find((_g) => {
                return _g.id == $scope.settings.storesSetting.itemUnit.id;
            });
            if ($scope.item.mainUnit) {
                $scope.addMainItemUnit($scope.item.mainUnit);
            }
        }

        $scope.resetItemUnit();
        $scope.resetSubstance();
        $scope.resetCollectedItem();
        site.showModal($scope.modalID);
        document.querySelector(`${$scope.modalID} .tab-link`).click();
    };

    $scope.showStoreData = function (_item) {
        $scope.mode = 'view';
        $scope.unit = { ..._item };
        site.showModal($scope.modalStoreData);
    };

    $scope.showModalUnitConversionData = function (_item) {
        $scope.unitConversion = { active: true, approved: false };
        $scope.unitConversionList = [];
        _item.unitsList.forEach((_u) => {
            $scope.unitConversionList.push({
                id: _u.unit.id,
                code: _u.unit.code,
                nameAr: _u.unit.nameAr,
                nameEn: _u.unit.nameEn,
                conversion: _u.conversion,
                currentCount: _u.currentCount,
            });
        });
        site.showModal($scope.modalUnitConversionData);
    };

    $scope.validateUnitConversionData = function (_unitConversion) {
        $timeout(() => {
            if (_unitConversion.unit && _unitConversion.toUnit && _unitConversion.unit.id === _unitConversion.toUnit.id) {
                $scope.error = '##word.Cannot Make Conversion To The Same Unit##';
                return;
            }

            if (_unitConversion.count && !_unitConversion.count > 0) {
                $scope.error = '##word.Please Enter Conversion Count##';
                return;
            }
            if (_unitConversion.toUnit && _unitConversion.toUnit.id) {
                _unitConversion.newCount = (_unitConversion.count * _unitConversion.unit.conversion) / _unitConversion.toUnit.conversion;
                _unitConversion.newCount = site.toNumber(_unitConversion.newCount);
            }
        }, 300);
    };
    $scope.medicalInformationsError = '';

    $scope.add = function (_item) {
        $scope.error = '';
        $scope.medicalInformationsError = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }

        const dataValid = $scope.validateData(_item);

        if (!dataValid.success) {
            return;
        }

        _item = dataValid._item;
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
        $scope.resetItemUnit();
        $scope.resetSubstance();
        $scope.resetCollectedItem();
    };

    $scope.showUpdate = function (_item) {
        $scope.error = '';
        $scope.mode = 'edit';
        $scope.view(_item);
        $scope.resetItemUnit();
        $scope.resetSubstance();
        $scope.resetCollectedItem();
        $scope.item = {};
        site.showModal($scope.modalID);

        document.querySelector(`${$scope.modalID} .tab-link`).click();
    };

    $scope.update = function (_item) {
        $scope.error = '';
        $scope.medicalInformationsError = '';
        const v = site.validated($scope.modalID);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }

        const dataValid = $scope.validateData(_item);

        if (!dataValid.success) {
            return;
        }

        let item = { ...dataValid._item };

        $scope.busy = true;
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/update`,
            data: item,
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
        $scope.resetItemUnit();
        $scope.resetSubstance();
        $scope.resetCollectedItem();
    };

    $scope.showView = function (_item) {
        $scope.error = '';
        $scope.mode = 'view';
        $scope.item = {};
        $scope.view(_item);
        site.showModal($scope.modalID);
        document.querySelector(`${$scope.modalID} .tab-link`).click();
    };

    $scope.view = function (_item, where) {
        $scope.busy = true;
        $scope.error = '';
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/view`,
            data: {
                where: { where },
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
        document.querySelector(`${$scope.modalID} .tab-link`).click();
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
                select: {
                    id: 1,
                    code: 1,
                    nameEn: 1,
                    nameAr: 1,
                    image: 1,
                    active: 1,
                    itemType: 1,
                    unitsList: 1,
                    itemGroup: 1,
                    medicalInformations: 1,
                    workByBatch: 1,
                    workBySerial: 1,
                    validityDays: 1,
                    collectedItemsList: 1,
                    hasMedicalData: 1,
                    collectionItem: 1,
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

    $scope.getItemsGroups = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }

        $scope.busy = true;
        $scope.itemsgroupsList = [];
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
                },
                search: $search,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.itemsgroupsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getItemsTypes = function () {
        $scope.busy = true;
        $scope.itemsTypesList = [];
        $http({
            method: 'POST',
            url: '/api/itemsTypes',
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
                    $scope.itemsTypesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getStoresUnits = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }

        $scope.busy = true;
        $scope.storesUnitsList = [];
        $http({
            method: 'POST',
            url: '/api/storesUnits/all',
            data: {
                where: { active: true },
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
                    $scope.storesUnitsList = response.data.list;
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
                where: { active: true },
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

    $scope.getActiveSubstances = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }

        $scope.busy = true;
        $scope.activeSubstancesList = [];
        $http({
            method: 'POST',
            url: '/api/activeSubstances/all',
            data: {
                where: { active: true },
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
                    $scope.activeSubstancesList = response.data.list;
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

    $scope.setMedicalInformations = function (elem) {
        if (elem.hasMedicalData) {
            $scope.getActiveSubstances();
            $scope.item.medicalInformations = { activeSubstancesList: [], indications: '', contraindications: '', howToUse: '' };
        } else {
            delete $scope.item.medicalInformations;
        }
    };

    $scope.addActiveSubstance = function (elem) {
        for (const itm of $scope.item.medicalInformations.activeSubstancesList) {
            if (itm.activeSubstance.id === elem.activeSubstance.id) {
                $scope.medicalInformationsError = '##word.Active Substance Exisit##';
                return;
            }
        }
        if (!elem.concentration > 0) {
            $scope.medicalInformationsError = '##word.Concentration Required##';
            return;
        }
        $scope.item.medicalInformations.activeSubstancesList.unshift({
            activeSubstance: elem.activeSubstance,
            concentration: elem.concentration,
        });
        $scope.medicalInformationsError = '';
        $scope.substance = { ...$scope.substance };
    };

    $scope.addMainItemUnit = function (itemUnit) {
        if (!itemUnit.id) {
            $scope.unitsInformationsError = '##word.Please Enter Item Unit##';
            return;
        }

        let mainUnitIndex = $scope.item.unitsList.findIndex((unt) => unt.unit.id === itemUnit.id);

        if (mainUnitIndex !== -1) {
            $scope.unitsInformationsError = '##word.Unit Exisit##';
            return;
        }

        $scope.item.unitsList.unshift({
            unit: itemUnit,
            conversion: 1,
            purchaseCost: 0,
            currentCount: 0,
            purchasePrice: 0,
            salesPrice: 0,
            averageCost: 0,
            discount: 0,
            maxDiscount: 0,
            discountType: 'value',
            storesList: [],
            active: true,
        });
        $scope.unitsInformationsError = '';
    };

    $scope.addItemUnitToItemUnitsList = function (itemUnit) {
        if (!itemUnit.unit && !itemUnit.unit.id) {
            $scope.unitsInformationsError = '##word.Please Enter Item Unit##';
            return;
        }

        if (!itemUnit.barcode) {
            $scope.unitsInformationsError = '##word.Please Enter Barcode##';
            return;
        }

        if (itemUnit.conversion < 0) {
            $scope.unitsInformationsError = '##word.Conversion Required##';
            return;
        }

        let mainUnitIndex = $scope.item.unitsList.findIndex((unt) => unt.unit.id === itemUnit.unit.id);

        if (mainUnitIndex !== -1) {
            $scope.unitsInformationsError = '##word.Unit Exisit##';
            return;
        }

        $scope.item.unitsList.push({
            unit: itemUnit.unit,
            conversion: itemUnit.conversion,
            barcode: itemUnit.barcode,
            purchaseCost: 0,
            currentCount: 0,
            purchasePrice: 0,
            salesPrice: 0,
            averageCost: 0,
            discount: itemUnit.discount,
            maxDiscount: itemUnit.maxDiscount,
            discountType: itemUnit.discountType,
            storesList: [],
            active: true,
        });
        $scope.unitsInformationsError = '';
        $scope.resetItemUnit();
    };

    $scope.setItemCollectionInformations = function (elem) {
        if (elem.collectionItem) {
            $scope.loadSubItem();
            $scope.item.collectedItemsList = [];
        } else {
            delete $scope.item.collectedItemsList;
        }
    };

    $scope.loadSubItem = function () {
        $scope.busy = true;
        $scope.notCollectionItemsList = [];
        $http({
            method: 'POST',
            url: `${$scope.baseURL}/api/${$scope.appName}/all`,
            data: {
                where: {
                    active: true,
                    allowSale: true,
                    collectionItem: false,
                },
                select: {
                    id: 1,
                    code: 1,
                    nameAr: 1,
                    nameEn: 1,
                    unitsList: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.notCollectionItemsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getItemUnits = function (item) {
        $scope.collectedItemUnits = [];
        for (const elem of item.unitsList) {
            $scope.collectedItemUnits.push({
                id: elem.unit.id,
                code: elem.unit.code,
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
            });
            $scope.collectedItem.unit = $scope.collectedItemUnits[0];
        }
    };

    $scope.addToItemCollections = function (elem) {
        for (const itm of $scope.item.collectedItemsList) {
            if (itm.item.id === elem.item.id) {
                $scope.collectionItemsInformationsError = '##word.Item Exisit##';
                return;
            }
        }
        if (!elem.item.id) {
            $scope.collectionItemsInformationsError = '##word.Item Missing##';
            return;
        }
        if (!elem.quantity > 0) {
            $scope.collectionItemsInformationsError = '##word.Please Enter Count ##';
            return;
        }
        $scope.item.collectedItemsList.unshift({
            item: elem.item,
            unit: elem.unit,
            quantity: elem.quantity,
        });
        $scope.collectionItemsInformationsError = '';
        $scope.collectedItem = { ...$scope.collectedItem };
        $scope.collectedItemUnits = [];
    };

    $scope.addConvertUnits = function (_item) {
        $scope.error = '';
        const v = site.validated($scope.modalUnitConversionData);
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }

        _item.itemsList = [
            {
                id: $scope.item.id,
                code: $scope.item.code,
                nameAr: $scope.item.nameAr,
                nameEn: $scope.item.nameEn,
                itemGroup: $scope.item.itemGroup,
                unit: _item.unit,
                toUnit: _item.toUnit,
                currentCount: _item.currentCount,
                conversion: _item.toUnit.conversion,
                count: _item.count,
                newCount: _item.newCount,
            },
        ];
        $scope.busy = true;

        $http({
            method: 'POST',
            url: '/api/convertUnits/add',
            data: _item,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done) {
                    site.hideModal($scope.modalUnitConversionData);
                    site.resetValidated($scope.modalUnitConversionData);
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
    $scope.showBatches = function (_item) {
        $scope.batch = _item;
        site.showModal('#batchesModal');
    };

    $scope.validateData = function (_item) {
        let success = false;

        if (!_item.unitsList.length) {
            $scope.error = '##word.Please Enter Item Unit##';
            return success;
        }
        if (_item.hasMedicalData && !_item.medicalInformations.activeSubstancesList?.length) {
            $scope.error = '##word.Must Enter Activesubstance##';
            return success;
        }

        if (_item.collectionItem && (!_item.collectedItemsList || _item.collectedItemsList.length < 2)) {
            $scope.error = '##word.Collected Items Must Be Greater Than Two Items##';
            return success;
        }

        if (_item.workByBatch && _item.validityDays < 1) {
            $scope.error = '##word.Please Enter Validity Days##';
            return success;
        }

        success = true;
        return { success, _item };
    };

    $scope.getAll();
    $scope.getStoresUnits();
    $scope.getStores();
    $scope.getItemsTypes();
    $scope.getNumberingAuto();
    $scope.getItemsGroups();
    $scope.getSetting();
});
