app.controller('servicesOrders', function ($scope, $http, $timeout) {
  $scope.baseURL = '';
  $scope.appName = 'servicesOrders';
  $scope.modalID = '#servicesOrdersManageModal';
  $scope.modalSearchID = '#servicesOrdersSearchModal';
  $scope.mode = 'add';
  $scope.structure = {
    date: new Date(),
    type: 'out',
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.item = { ...$scope.structure, servicesList: [] };
    site.resetValidated($scope.modalID);
    site.showModal($scope.modalID);
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

  $scope.getservicesOrdersTypeList = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/servicesTypeGroups',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.servicesOrdersTypeList = response.data.list;
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

  $scope.getPatientsList = function () {
    $scope.busy = true;
    $scope.patientsList = [];
    $http({
      method: 'POST',
      url: '/api/patients/all',
      data: {
        where: { active: true, 'type.id': 1 },
        select: {
          id: 1,
          code: 1,
          image: 1,
          fullNameEn: 1,
          fullNameAr: 1,
          patientType: 1,
          maritalStatus: 1,
          gender: 1,
          age: 1,
          motherNameEn: 1,
          motherNameAr: 1,
          newBorn: 1,
          nationality: 1,
          mobileList: 1,
          patientType: 1,
          insuranceCompany: 1,
          insuranceClass: 1,
          expiryDate: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.patientsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getMainIncuranceFromSub = function (insuranceCompany) {
    $scope.busy = true;
    console.log($scope.item.patient);
    $http({
      method: 'POST',
      url: '/api/mainIncurances/fromSub',
      data: {
        insuranceCompany: insuranceCompany.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.item.mainInsuranceCompany = response.data.doc;
          if ($scope.item.patient.insuranceClass && $scope.item.patient.insuranceClass.id) {
            $scope.getNphisElig($scope.item.patient.insuranceClass.id);
          } else {
            $scope.item.nphis = 'nElig';
            $scope.item.payment = 'cash';
            $scope.item.errMsg = 'There is no incurance class for the patient';
          }
        } else {
          $scope.item.nphis = 'nElig';
          $scope.item.payment = 'cash';
          $scope.item.errMsg = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNphisElig = function (insuranceClassId) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/nphisElig/patient',
      data: {
        insuranceClassId,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.elig) {
            $scope.item.nphis = 'elig';
            $scope.item.payment = 'credit';
          } else {
            $scope.item.nphis = 'nElig';
            $scope.item.payment = 'cash';
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getHospitalCentersList = function () {
    $scope.busy = true;
    $scope.hospitalCentersList = [];
    $http({
      method: 'POST',
      url: '/api/hospitalCenters/all',
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
          $scope.hospitalCentersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDoctorsList = function () {
    $scope.busy = true;
    $scope.doctorsList = [];
    $http({
      method: 'POST',
      url: '/api/doctors/all',
      data: {
        where: { active: true, 'type.id': 2 },
        select: {
          id: 1,
          code: 1,
          nameEn: 1,
          nameAr: 1,
          image: 1,
          hospitalCenter: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.doctorsList = response.data.list;
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
          serviceGroup: 1,
          creditPriceOut: 1,
          cashPriceOut: 1,
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

  $scope.addServices = function (_item) {
    $scope.error = '';
    if (_item.$service && _item.$service.id) {
      $http({
        method: 'POST',
        url: '/api/serviceMainIncurance',
        data: {
          mainInsuranceCompany: $scope.item.mainInsuranceCompany,
          patientClass: _item.patient.insuranceClass,
          service: _item.$service,
          payment: _item.payment,
          type: _item.type,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          let service = {};
          if (response.data.done && response.data.doc) {
            service = { ...response.data.doc, qty: 1 };
          } else {
            service = {
              id: _item.$service.id,
              nameAr: _item.$service.nameAr,
              nameEn: _item.$service.nameEn,
              nameEn: _item.$service.nameEn,
              serviceGroup: _item.$service.serviceGroup,
              discount: 0,
              comVat: 0,
              pVat: 0,
              qty: 1,
            };
            if ($scope.item.type == 'out') {
              if ($scope.item.payment == 'cash') {
                service.price = $scope.item.$service.creditPriceOut;
              } else if ($scope.item.payment == 'credit') {
                service.price = $scope.item.$service.creditPriceOut;
              }
            } else if ($scope.item.type == 'in') {
              if ($scope.item.payment == 'cash') {
                service.price = $scope.item.$service.cashPriceIn;
              } else if ($scope.item.payment == 'credit') {
                service.price = $scope.item.$service.creditPriceIn;
              }
            }
            service.total = service.price + (service.price * service.vat) / 100;
            service.total = site.toNumber(service.total);
          }
          if (_item.doctor && _item.doctor.hospitalCenter) {
            service.hospitalCenter = { ..._item.doctor.hospitalCenter };
          }
          if (!_item.servicesList.some((s) => s.id === _item.$service.id)) {
            _item.servicesList.push(service);
            $scope.calc(_item);
          } else {
            _item.servicesList.forEach((_s) => {
              if (_s.id === _item.$service.id) {
                _s.qty += 1;
                $scope.calc(_item);
              }
            });
          }
          _item.$service = {};
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    } else {
      $scope.error = 'Must Select Service';
      return;
    }
  };

  $scope.calc = function (_item) {
    $scope.error = '';
    $timeout(() => {
      _item.grossAmount = 0;
      _item.discount = 0;
      _item.deductables = 0;
      _item.patientVat = 0;
      _item.companyVat = 0;
      _item.netAmount = 0;
      _item.patientBalance = 0;
      _item.accBalance = 0;

      _item.servicesList.forEach((_service) => {
        let net = _service.price - (_service.price * _service.discount) / 100;
        _service.total = net * _service.qty;
        _item.grossAmount += _service.price * _service.qty;
        _item.discount += _service.discount * _service.qty;
        _item.patientVat += _service.pVat * _service.qty;
        _item.companyVat += _service.comVat * _service.qty;
      });
      _item.netAmount = _item.grossAmount - _item.discount;
    }, 300);
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
  $scope.getservicesOrdersTypeList();
  $scope.getServicesList();
  $scope.getPatientsList();
  $scope.getDoctorsList();
  $scope.getHospitalCentersList();
});
