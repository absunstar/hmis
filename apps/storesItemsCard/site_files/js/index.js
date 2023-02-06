app.controller('storesItemsCard', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'storesItemsCard';
    $scope.modalID = '#storesItemsCardManageModal';
    $scope.modalSearchID = '#storesItemsCardSearchModal';
    $scope.mode = 'add';
    $scope.search = {
        fromDate: new Date(),
        toDate: new Date(),
    };
    $scope.structure = {
        // image: { url: '/images/storesItemsCard.png' },
        // active: true,
    };
    $scope.item = {};
    $scope.list = [];

    // $scope.showAdd = function (_item) {
    //   $scope.error = '';
    //   $scope.mode = 'add';
    //   $scope.item = { ...$scope.structure };
    //   site.showModal($scope.modalID);
    // };

    // $scope.add = function (_item) {
    //   $scope.error = '';
    //   const v = site.validated($scope.modalID);
    //   if (!v.ok) {
    //     $scope.error = v.messages[0].ar;
    //     return;
    //   }

    //   $scope.busy = true;
    //   $http({
    //     method: 'POST',
    //     url: `${$scope.baseURL}/api/${$scope.appName}/add`,
    //     data: $scope.item,
    //   }).then(
    //     function (response) {
    //       $scope.busy = false;
    //       if (response.data.done) {
    //         site.hideModal($scope.modalID);
    //         site.resetValidated($scope.modalID);
    //         $scope.list.push(response.data.doc);
    //       } else {
    //         $scope.error = response.data.error;
    //         if (response.data.error && response.data.error.like('*Must Enter Code*')) {
    //           $scope.error = '##word.Must Enter Code##';
    //         }
    //       }
    //     },
    //     function (err) {
    //       console.log(err);
    //     }
    //   );
    // };

    // $scope.showUpdate = function (_item) {
    //   $scope.error = '';
    //   $scope.mode = 'edit';
    //   $scope.view(_item);
    //   $scope.item = {};
    //   site.showModal($scope.modalID);
    // };

    // $scope.update = function (_item) {
    //   $scope.error = '';
    //   const v = site.validated($scope.modalID);
    //   if (!v.ok) {
    //     $scope.error = v.messages[0].ar;
    //     return;
    //   }
    //   $scope.busy = true;
    //   $http({
    //     method: 'POST',
    //     url: `${$scope.baseURL}/api/${$scope.appName}/update`,
    //     data: _item,
    //   }).then(
    //     function (response) {
    //       $scope.busy = false;
    //       if (response.data.done) {
    //         site.hideModal($scope.modalID);
    //         site.resetValidated($scope.modalID);
    //         let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
    //         if (index !== -1) {
    //           $scope.list[index] = response.data.result.doc;
    //         }
    //       } else {
    //         $scope.error = 'Please Login First';
    //       }
    //     },
    //     function (err) {
    //       console.log(err);
    //     }
    //   );
    // };

    // $scope.showView = function (_item) {
    //     $scope.error = '';
    //     $scope.mode = 'view';
    //     $scope.item = {};
    //     $scope.view(_item);
    //     site.showModal($scope.modalID);
    // };

    // $scope.view = function (_item) {
    //     $scope.busy = true;
    //     $scope.error = '';
    //     $http({
    //         method: 'POST',
    //         url: `${$scope.baseURL}/api/${$scope.appName}/view`,
    //         data: {
    //             id: _item.id,
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done) {
    //                 $scope.item = response.data.doc;
    //             } else {
    //                 $scope.error = response.data.error;
    //             }
    //         },
    //         function (err) {
    //             console.log(err);
    //         }
    //     );
    // };

    // $scope.showDelete = function (_item) {
    //   $scope.error = '';
    //   $scope.mode = 'delete';
    //   $scope.item = {};
    //   $scope.view(_item);
    //   site.showModal($scope.modalID);
    // };

    // $scope.delete = function (_item) {
    //   $scope.busy = true;
    //   $scope.error = '';

    //   $http({
    //     method: 'POST',
    //     url: `${$scope.baseURL}/api/${$scope.appName}/delete`,
    //     data: {
    //       id: $scope.item.id,
    //     },
    //   }).then(
    //     function (response) {
    //       $scope.busy = false;
    //       if (response.data.done) {
    //         site.hideModal($scope.modalID);
    //         let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
    //         if (index !== -1) {
    //           $scope.list.splice(index, 1);
    //         }
    //       } else {
    //         $scope.error = response.data.error;
    //       }
    //     },
    //     function (err) {
    //       console.log(err);
    //     }
    //   );
    // };

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

    // $scope.getNumberingAuto = function () {
    //     $scope.error = '';
    //     $scope.busy = true;
    //     $http({
    //         method: 'POST',
    //         url: '/api/numbering/getAutomatic',
    //         data: {
    //             screen: $scope.appName,
    //         },
    //     }).then(
    //         function (response) {
    //             $scope.busy = false;
    //             if (response.data.done) {
    //                 $scope.disabledCode = response.data.isAuto;
    //             }
    //         },
    //         function (err) {
    //             $scope.busy = false;
    //             $scope.error = err;
    //         }
    //     );
    // };

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

    $scope.getVendors = function () {
        $scope.busy = true;
        $scope.vendorsList = [];
        $http({
            method: 'POST',
            url: '/api/vendors/all',
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
                    $scope.vendorsList = response.data.list;
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

    $scope.getItemsGroup = function () {
        $scope.busy = true;
        $scope.itemsGroupList = [];
        $http({
            method: 'POST',
            url: '/api/itemsGroup/all',
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
                    $scope.itemsGroupList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getAll();
    $scope.getItemsGroup();
    $scope.getStoresItems();
    $scope.getStores();
    $scope.getVendors();
    // $scope.getNumberingAuto();
});
