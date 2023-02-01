app.controller('mainInsuranceCompanies', function ($scope, $http, $timeout) {
  $scope.baseURL = '';
  $scope.appName = 'mainInsuranceCompanies';
  $scope.modalID = '#mainInsuranceCompaniesManageModal';
  $scope.modalSearchID = '#mainInsuranceCompaniesSearchModal';
  $scope.mode = 'add';
  $scope._search = {};
  $scope.structure = {
    image: '/images/mainInsuranceCompanies.png',
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.item = {
      ...$scope.structure,
      discountServicesCategoriesList: [],
      discountServicesGroupsList: [],
      discountServicesList: [],
      coverageServicesCategoriesList: [],
      coverageServicesGroupsList: [],
      coverageServicesList: [],
      packageServicesGroupsList: [],
    };
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.add = function (_item) {
    $scope.error = '';
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
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
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.update = function (_item) {
    $scope.error = '';
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
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

  $scope.getCountriesList = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
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
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          country: country,
          active: true,
        },
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
          $scope.govesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCitiesList = function (gov) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/cities/all',
      data: {
        where: {
          gov: gov,
          active: true,
        },
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
          $scope.citiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreasList = function (city) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/areas/all',
      data: {
        where: {
          city: city,
          active: true,
        },
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
          $scope.areasList = response.data.list;
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

  $scope.getIncuranceClassesList = function (obj) {
    $scope.busy = true;
    obj.$incuranceClassesList = [];
    $http({
      method: 'POST',
      url: '/api/insuranceClasses/all',
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
          obj.$incuranceClassesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getServicesGroupsList = function () {
    $scope.busy = true;
    $scope.servicesGroupsList = [];
    $http({
      method: 'POST',
      url: '/api/servicesGroups/all',
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
          $scope.servicesGroupsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getServicesCategoriesList = function () {
    $scope.busy = true;
    $scope.servicesCategoriesList = [];
    $http({
      method: 'POST',
      url: '/api/servicesCategories/all',
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
          $scope.servicesCategoriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getServicesList = function () {
    $scope.busy = true;
    $scope.servicesList = [];
    $http({
      method: 'POST',
      url: '/api/services/all',
      data: {
        where: { active: true },
        select: {
          id: 1,
          code: 1,
          nameEn: 1,
          nameAr: 1,
          cashPriceOut: 1,
          creditPriceOut: 1,
          cashPriceIn: 1,
          creditPriceIn: 1,
          packagePrice: 1,
          vat: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.servicesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addDiscountServicesGroups = function (_item) {
    $scope.error = '';
    if (_item.$discountServiceGroup && _item.$discountServiceGroup.id) {
      if (!_item.discountServicesGroupsList.some((s) => s.id === _item.$discountServiceGroup.id)) {
        _item.discountServicesGroupsList.push({
          ..._item.$discountServiceGroup,
          cashOut: 0,
          creditOut: 0,
          cashIn: 0,
          creditIn: 0,
          secondAmnt: 0,
          secoundAmountPerDay: 0,
        });
      }
      _item.$discountServiceGroup = {};
    } else {
      $scope.error = 'Must Select Service Group';
      return;
    }
  };

  $scope.addDiscountServicesCategories = function (_item) {
    $scope.error = '';
    if (_item.$discountServiceCategory && _item.$discountServiceCategory.id) {
      if (!_item.discountServicesCategoriesList.some((s) => s.id === _item.$discountServiceCategory.id)) {
        _item.discountServicesCategoriesList.push({
          ..._item.$discountServiceCategory,
          cashOut: 0,
          creditOut: 0,
          cashIn: 0,
          creditIn: 0,
        });
      }
      _item.$discountServiceCategory = {};
    } else {
      $scope.error = 'Must Select Service Category';
      return;
    }
  };

  $scope.addDiscountServices = function (_item) {
    $scope.error = '';
    if (_item.$discountService && _item.$discountService.id) {
      if (!_item.discountServicesList.some((s) => s.id === _item.$discountService.id)) {
        _item.discountServicesList.push({
          ..._item.$discountService,
          cashIn: 0,
          CreditIn: 0,
          cashOut: 0,
          CreditOut: 0,
          packagePrice: 0,
          packagePrice: 0,
        });
      }
      _item.$discountService = {};
    } else {
      $scope.error = 'Must Select Service';
      return;
    }
  };

  $scope.addCoverageServicesGroups = function (_item) {
    $scope.error = '';
    if (_item.$coverageServiceGroup && _item.$coverageServiceGroup.id) {
      if (!_item.coverageServicesGroupsList.some((s) => s.id === _item.$coverageServiceGroup.id)) {
        _item.coverageServicesGroupsList.push({
          ..._item.$coverageServiceGroup,
          incuranceClassesList : [],
        });
        $scope.getIncuranceClassesList(_item.coverageServicesGroupsList[_item.coverageServicesGroupsList.length - 1]);
      }
      _item.$coverageServiceGroup = {};
    } else {
      $scope.error = 'Must Select Service Group';
      return;
    }
  };

  $scope.addCoverageServicesCategories = function (_item) {
    $scope.error = '';
    if (_item.$coverageServiceCategory && _item.$coverageServiceCategory.id) {
      if (!_item.coverageServicesCategoriesList.some((s) => s.id === _item.$coverageServiceCategory.id)) {
        _item.coverageServicesCategoriesList.push({
          ..._item.$coverageServiceCategory,
          incuranceClassesList : [],
    
        });
        $scope.getIncuranceClassesList(_item.coverageServicesCategoriesList[_item.coverageServicesCategoriesList.length - 1]);
      }
      _item.$coverageServiceCategory = {};
    } else {
      $scope.error = 'Must Select Service Category';
      return;
    }
  };

  $scope.addCoverageServices = function (_item) {
    $scope.error = '';
    if (_item.$coverageService && _item.$coverageService.id) {
      if (!_item.coverageServicesList.some((s) => s.id === _item.$coverageService.id)) {
        _item.coverageServicesList.push({
          ..._item.$coverageService,
          incuranceClassesList : [],
        });
        $scope.getIncuranceClassesList(_item.coverageServicesList[_item.coverageServicesList.length - 1]);
      }
      _item.$coverageService = {};
    } else {
      $scope.error = 'Must Select Service';
      return;
    }
  };

  $scope.addPackageServicesGroups = function (_item) {
    $scope.error = '';
    if (_item.$packageServiceGroup && _item.$packageServiceGroup.id) {
      if (!_item.packageServicesGroupsList.some((s) => s.id === _item.$packageServiceGroup.id)) {
        _item.packageServicesGroupsList.push({
          ..._item.$packageServiceGroup,
          discount: 0,
        });
      }
      _item.$packageServiceGroup = {};
    } else {
      $scope.error = 'Must Select Service Group';
      return;
    }
  };

  $scope.addIncuranceClasses = function (obj) {
    $scope.busy = true;

    if (obj.$incuranceClass && !obj.incuranceClassesList.some((k) => k.id === obj.$incuranceClass.id)) {
      obj.incuranceClassesList.push(obj.$incuranceClass);
    }
    obj.$incuranceClass = '';
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

  $scope.getAll();
  $scope.getNumberingAuto();
  $scope.getCountriesList();
  $scope.getServicesCategoriesList();
  $scope.getServicesGroupsList();
  $scope.getServicesList();
});
