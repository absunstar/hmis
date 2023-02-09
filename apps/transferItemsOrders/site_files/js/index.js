app.controller('transferItemsOrders', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'transferItemsOrders';
    $scope.modalID = '#transferItemsOrdersManageModal';
    $scope.modalSearchID = '#transferItemsOrdersSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {
        image: { url: '/images/transferItemsOrders.png' },
        orderDate: new Date(),
        itemsList: [],
        approved: false,
        active: true,
    };
    $scope.item = {};
    $scope.list = [];
    $scope.orderItem = {
        item: {},
        unit: {},
        transferFromCount: 1,
        approved: false,
        currentBalance: 0,
    };
    $scope.resetOrderItem = function () {
        $scope.orderItem = {
            item: {},
            unit: {},
            transferFromCount: 1,
            approved: false,
            currentBalance: 0,
        };
    };

    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.itemsError = '';
        $scope.mode = 'add';
        $scope.item = { ...$scope.structure };
        $scope.resetOrderItem();
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

        if (_item.fromStore && _item.toStore && _item.fromStore.id === _item.toStore.id) {
            alert('##word.Same Store##');
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
        if (_item.fromStore && _item.toStore && _item.fromStore.id === _item.toStore.id) {
            alert('##word.Same Store##');
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
        if (_item.fromStore && _item.toStore && _item.fromStore.id === _item.toStore.id) {
            alert('##word.Same Store##');
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
                console.log('response', response);

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

    $scope.getpurchaseOrdersSource = function () {
        $scope.busy = true;
        $scope.transferItemsOrdersSourcesList = [];
        $http({
            method: 'POST',
            url: '/api/transferItemsOrdersSource',
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
                    $scope.transferItemsOrdersSourcesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getTransferItemsRequests = function () {
        $scope.busy = true;
        $scope.transferItemsRequestsList = [];
        $scope.item.itemsList = [];
        $http({
            method: 'POST',
            url: '/api/transferItemsRequests/all',
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
                    requestDate: 1,
                    active: 1,
                    itemsList: 1,
                    fromStore: 1,
                    toStore: 1,
                },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.transferItemsRequestsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getRequestItems = function (transferItemsRequest) {
        $scope.item.itemsList = [];
        for (const elem of transferItemsRequest.itemsList) {
            $scope.item.itemsList.push({
                item: elem.item,
                unit: elem.unit,
                item: elem.item,
                unit: elem.unit,
                transferFromCount: elem.transferFromCount,
                approved: true,
            });
        }
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
                    type: 1,
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
        $scope.storesItemsList = [];
        $http({
            method: 'POST',
            url: '/api/storesItems/all',
            data: {
                where: {
                    active: true,
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
                    $scope.storesItemsList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.setFromAndToStoreValue = function (transferItemsRequest) {
        if ($scope.item.source.id !== 1) {
            $scope.item.fromStore = null;
            $scope.item.toStore = null;
        } else if ($scope.item.source.id === 1 && transferItemsRequest.fromStore && transferItemsRequest.toStore) {
            $scope.item.fromStore = transferItemsRequest.fromStore;
            $scope.item.toStore = transferItemsRequest.toStore;
        }
    };

    $scope.validateStores = function () {
        if ($scope.item.fromStore && $scope.item.toStore && $scope.item.fromStore.id === $scope.item.toStore.id) {
            alert('##word.Same Store##');
            return;
        }
        $scope.error = '';
    };

    $scope.getItemUnits = function (item) {
        $scope.unitsList = [];
        for (const elem of item.unitsList) {
            $scope.unitsList.push({
                id: elem.unit.id,
                nameEn: elem.unit.nameEn,
                nameAr: elem.unit.nameAr,
                storesList: elem.storesList,
            });
            $scope.orderItem.unit = $scope.unitsList[0];
        }
        $scope.calculateItemBalance($scope.unitsList[0]);
    };

    $scope.calculateItemBalance = function (unit) {
        if (!unit.storesList || !unit.storesList.length || !$scope.item.fromStore?.id) return;
        const storeIndex = unit.storesList.findIndex((str) => str.store.id === $scope.item.fromStore.id);
        if (storeIndex === -1) {
            $scope.orderItem.currentBalance = 0;
            return;
        } else {
            const totalIncome =
                unit.storesList[storeIndex].purchaseCount + unit.storesList[storeIndex].bonusCount + unit.storesList[storeIndex].unassembledCount + unit.storesList[storeIndex].salesReturnCount;

            const totalOut =
                unit.storesList[storeIndex].salesCount + unit.storesList[storeIndex].purchaseReturnCount + unit.storesList[storeIndex].damagedCount + unit.storesList[storeIndex].assembledCount;

            const currentBalance = totalIncome - totalOut;
            $scope.orderItem.currentBalance = currentBalance;
        }
    };

    $scope.addToItemsList = function (elem) {
        $scope.error = '';
        if (!elem.item.id) {
            $scope.error = '##word.Please Enter Item##';
            return;
        }
        for (const itm of $scope.item.itemsList) {
            if (itm.item.id === elem.item.id) {
                $scope.itemsError = '##word.Item Exisit##';
                return;
            }
        }

        if (elem.transferFromCount < 1) {
            $scope.itemsError = '##word.Please Enter Count##';
            return;
        }

        if (!elem.currentBalance > 0) {
            $scope.itemsError = '##word.Item balance Is Zero##';
            return;
        }

        if (elem.transferFromCount > elem.currentBalance) {
            $scope.itemsError = '##word.Transfer Count Bigger Than Current Balance##';
            return;
        }

        $scope.item.itemsList.unshift(elem);
        $scope.resetOrderItem();
        $scope.itemsError = '';
    };

    $scope.approveItem = function (elem) {
        $scope.itemsError = '';

        if (elem.transferFromCount < 1) {
            $scope.itemsError = '##word.Please Enter Valid Numbers##';
            return;
        } else {
            for (const itm of $scope.item.itemsList) {
                if (itm.item.id === elem.item.id) {
                    itm.approved = true;
                }
            }
            $scope.prpepareToApproveOrder($scope.item);
        }
    };

    $scope.unapproveItem = function (elem) {
        $scope.itemsError = '';
        for (const itm of $scope.item.itemsList) {
            if (itm.item.id === elem.item.id) {
                itm.approved = false;
                $scope.canApprove = false;
            }
        }
    };

    $scope.prpepareToApproveOrder = function (_item) {
        let allApproved = _item.itemsList.every((elem) => elem.approved === true);
        if (allApproved) {
            $scope.canApprove = true;
        } else {
            $scope.canApprove = false;
        }
    };

    $scope.calculateTotalInItemsList = function (itm) {
        if (itm.transferFromCount < 1) {
            $scope.itemsError = '##word.Please Enter Valid Numbers##';
            return;
        }
    };

    $scope.getAll();
    $scope.getStores();
    $scope.getStoresItems();
    $scope.getpurchaseOrdersSource();
    $scope.getNumberingAuto();
});
