app.controller('storesItems', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'storesItems';
    $scope.modalID = '#storesItemsManageModal';
    $scope.modalSearchID = '#storesItemsSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: { url: '/images/storesItems.png' },
        allowSale: true,
        allowBuy: true,
        workByBatch: true,
        unitsList: [],
        workBySerial: false,
        showOnTouchScreen: false,
        collectionItem: false,
        noVat: false,
        validityDays: 0,
        reorderLimit: 0,
        maxCapacity: 0,
        active: true,
    };
    $scope.item = {};
    $scope.list = [];

    $scope.itemUnit = {
        mainUnit: {},
        unit: {},
        conversion: 1,
    };

    $scope.substance = {
        activeSubstance: {},
        concentration: 0,
    };

    $scope.collectedItem = {
        item: {},
        unit: {},
        quantity: 1,
    };

    $scope.collectedItemUnits = [];
    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.mode = 'add';
        $scope.item = { ...$scope.structure };
        $scope.itemUnit = { ...$scope.itemUnit };
        $scope.substance = { ...$scope.substance };
        $scope.collectedItem = { ...$scope.collectedItem };
        site.showModal($scope.modalID);
        document.querySelector(`${$scope.modalID} .tab-link`).click();
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
        $scope.itemUnit = { ..._item.itemUnit };
        $scope.substance = { ..._item.substance };
        $scope.collectedItem = { ..._item.collectedItem };
    };

    $scope.showUpdate = function (_item) {
        $scope.error = '';
        $scope.mode = 'edit';
        $scope.view(_item);
        $scope.item = {};
        site.showModal($scope.modalID);

        $scope.itemUnit.mainUnit = _item.unitsList[0].unit;
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
        $scope.itemUnit = { ..._item.itemUnit };
        $scope.substance = { ..._item.substance };
        $scope.collectedItem = { ..._item.collectedItem };
    };

    $scope.showView = function (_item) {
        $scope.error = '';
        $scope.mode = 'view';
        $scope.item = {};
        $scope.view(_item);
        site.showModal($scope.modalID);
        $scope.itemUnit.mainUnit = _item.unitsList[0].unit;
        document.querySelector(`${$scope.modalID} .tab-link`).click();
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

    $scope.getItemsGroups = function () {
        $scope.busy = true;
        $scope.itemsgroupsList = [];
        $http({
            method: 'POST',
            url: '/api/itemsGroup/all',
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

    $scope.getStoresUnits = function () {
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

    $scope.getActiveSubstances = function () {
        $scope.busy = true;
        $scope.activeSubstancesList = [];
        $http({
            method: 'POST',
            url: '/api/activeSubstances/active',
            data: {
                where: { active: true },
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

    $scope.addItemUnitToItemUnitsList = function (itemUnit) {
        if ((!itemUnit.unit && !itemUnit.id) || (itemUnit.unit && !itemUnit.unit.id)) {
            $scope.unitsInformationsError = '##word.Please Enter Item Unit##';
            return;
        }

        if (itemUnit.unit && !itemUnit.conversion > 0) {
            $scope.unitsInformationsError = '##word.Conversion Required##';
            return;
        }

        if ($scope.item.unitsList.length) {
            for (const itm of $scope.item.unitsList) {
                if (itm.id === itemUnit.unit.id) {
                    $scope.unitsInformationsError = '##word.Unit Exisit##';
                    return;
                }
            }
        }
        let unit;
        if (itemUnit && !itemUnit.unit) {
            unit = itemUnit;
        } else {
            unit = itemUnit.unit;
        }
        $scope.item.unitsList.push({
            unit,
            conversion: itemUnit.conversion || 1,
            barcode: itemUnit.barcode,
            purchasePrice: 0,
            sellingPrice: 0,
            averageCost: 0,
            saleDiscount: 0,
            maxDiscount: 0,
            discountType: 'percent',
            storesList: [],
            active: true,
        });
        $scope.unitsInformationsError = '';
        $scope.itemUnit = { ...$scope.itemUnit };
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
    $scope.getItemsTypes();
    $scope.getNumberingAuto();
    $scope.getItemsGroups();
});
