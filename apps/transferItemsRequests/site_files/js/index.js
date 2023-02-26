app.controller('transferItemsRequests', function ($scope, $http, $timeout) {
  $scope.baseURL = '';
  $scope.appName = 'transferItemsRequests';
  $scope.modalID = '#transferItemsRequestsManageModal';
  $scope.modalSearchID = '#transferItemsRequestsSearchModal';
  $scope.mode = 'add';
  $scope._search = {};
  $scope.structure = {
    hasTransaction: false,
    approved: false,
    active: true,
  };
  $scope.item = {};
  $scope.list = [];
  $scope.canApprove = false;
  $scope.resetOrderItem = function () {
    $scope.orderItem = {
      count: 1,
      approved: false,
      currentBalance: 0,
    };
  };
  $scope.showAdd = function (_item) {
    $scope.error = '';
    $scope.itemsError = '';
    $scope.mode = 'add';
    $scope.resetOrderItem();
    $scope.item = { ...$scope.structure, requestDate: new Date(), itemsList: [] };
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

    if (!_item.itemsList.length) {
      $scope.error = '##word.Must Enter One Item At Least##';
      return;
    }
    if (_item.store && _item.toStore && _item.store.id === _item.toStore.id) {
      $scope.error = '##word.Same Store##';
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

    if (_item.store && _item.toStore && _item.store.id === _item.toStore.id) {
      $scope.error = '##word.Same Store##';
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

    if (_item.store && _item.toStore && _item.store.id === _item.toStore.id) {
      $scope.error = '##word.Same Store##';
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

  $scope.unapprove = function (_item) {
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

    _item['approved'] = false;
    $scope.busy = true;
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/unapprove`,
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
    $scope.item = {};
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
          itemGroup: 1,
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

  $scope.validateStores = function () {
    if ($scope.item.store && $scope.item.toStore && $scope.item.store.id === $scope.item.toStore.id) {
      $scope.error = '##word.Same Store##';
      return;
    }
  };

  $scope.getItemUnits = function (item) {
    $scope.error = '';
    $scope.unitsList = [];
    for (const elem of item.unitsList) {
      $scope.unitsList.push({
        id: elem.unit.id,
        code: elem.unit.code,
        nameEn: elem.unit.nameEn,
        nameAr: elem.unit.nameAr,
        storesList: elem.storesList,
        purchaseCost: elem.purchaseCost,
      });
      $scope.orderItem.unit = $scope.unitsList[0];
    }
    $scope.calculateItemBalance($scope.unitsList[0]);
  };

  $scope.calculateItemBalance = function (unit) {
    if (!unit.storesList || !unit.storesList.length || !$scope.item.store?.id) return;
    const storeIndex = unit.storesList.findIndex((str) => str.store.id === $scope.item.store.id);
    if (storeIndex === -1) {
      $scope.orderItem.currentBalance = 0;
      return;
    } else {
      const totalIncome =
        unit.storesList[storeIndex].purchaseCount + unit.storesList[storeIndex].bonusCount + unit.storesList[storeIndex].unassembledCount + unit.storesList[storeIndex].salesReturnCount;

      const totalOut = unit.storesList[storeIndex].salesCount + unit.storesList[storeIndex].purchaseReturnCount + unit.storesList[storeIndex].damagedCount + unit.storesList[storeIndex].assembledCount;

      const currentBalance = totalIncome - totalOut;
      $scope.orderItem.currentBalance = currentBalance;
    }
  };

  $scope.addToItemsList = function (elem) {
    $scope.error = '';
    if (!elem.item || !elem.item?.id) {
      $scope.itemsError = '##word.Please Enter Item##';
      return;
    }
    for (const itm of $scope.item.itemsList) {
      if (itm.id === elem.item.id && itm.unit.id === elem.unit.id) {
        $scope.itemsError = '##word.Item Exisit##';
        return;
      }
    }

    if (elem.count < 1) {
      $scope.itemsError = '##word.Please Enter Count##';
      return;
    }

    $scope.item.itemsList.unshift({
      id: elem.item.id,
      code: elem.item.code,
      nameAr: elem.item.nameAr,
      nameEn: elem.item.nameEn,
      itemGroup: elem.item.itemGroup,
      unit: { id: elem.unit.id, code: elem.unit.code, nameAr: elem.unit.nameAr, nameEn: elem.unit.nameEn },
      count: elem.count,
      purchaseCost: elem.unit.purchaseCost,
      approved: false,
    });

    $scope.itemsError = '';
  };

  $scope.approveItem = function (elem, i) {
    $scope.itemsError = '';
    if (elem.count < 1) {
      $scope.itemsError = '##word.Please Enter Valid Numbers##';
      return;
    } else {
      $scope.item.itemsList[i].approved = true;
      $scope.prpepareToApproveOrder($scope.item);
    }
  };

  $scope.unapproveItem = function (elem, i) {
    $scope.item.itemsList[i].approved = false;
    $scope.canApprove = false;
  };

  $scope.prpepareToApproveOrder = function (_item) {
    $scope.canApprove = false;
    const index = _item.itemsList.findIndex((elem) => elem.approved == false);
    if (index === -1) {
      $scope.canApprove = true;
    }
  };
  $scope.addFiles = function () {
    $scope.error = '';
    $scope.item.filesList = $scope.item.filesList || [];
    $scope.item.filesList.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: '##user.name##',
    });
  };

  $scope.getAll({date : new Date()});
  $scope.getStores();
  $scope.getStoresItems();
  $scope.getNumberingAuto();
});
