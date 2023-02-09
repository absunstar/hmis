app.controller('doctorDeskTop', function ($scope, $http, $timeout) {
  $scope.baseURL = '';
  $scope.appName = 'doctorDeskTop';
  $scope.modalID = '#doctorDeskTopManageModal';
  $scope.modalSearchID = '#doctorDeskTopSearchModal';
  $scope.mode = 'add';
  $scope.search = {};
  $scope.today = true;
  $scope.structure = {
    image: { url: '/images/doctorDeskTop.png' },
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.item = { ...$scope.structure };
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

  $scope.update = function (_item, modalID, id) {
    $scope.error = '';
    const v = site.validated(modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (id == 2) {
      _item.status = { id: 2, nameEn: 'At doctor', nameAr: 'عند الطبيب' };
    } else if (id == 3) {
      _item.status = { id: 3, nameEn: 'Detected', nameAr: 'تم الكشف' };
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
          site.hideModal(modalID);
          site.resetValidated(modalID);
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

  $scope.updateStatus = function (_item, id) {
    $scope.error = '';
    if (id == 1) {
      _item.status = { id: 1, nameEn: 'Pending', nameAr: 'قيد الإنتظار' };
    } else if (id == 2) {
      _item.status = { id: 2, nameEn: 'At doctor', nameAr: 'عند الطبيب' };
    } else if (id == 3) {
      _item.status = { id: 3, nameEn: 'Detected', nameAr: 'تم الكشف' };
    } else if (id == 4) {
      _item.status = { id: 4, nameEn: 'Cancel detection', nameAr: 'إلغاء الكشف' };
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
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list[index] = response.data.result.doc;
            site.showModal('#alert');
            $timeout(() => {
              site.hideModal('#alert');
            }, 1500);
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

  $scope.showDoctorRecommendations = function (_item) {
    $scope.error = '';
    $scope.item = {};
    $scope.view(_item);
    site.showModal('#doctorRecommendationsModal');
    document.querySelector(`#doctorRecommendationsModal .tab-link`).click();
  };

  $scope.showVitalsNotes = function (_item) {
    $scope.error = '';
    $scope.item = {};
    $scope.view(_item);
    site.showModal('#vitalsNotesModal');
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

  $scope.getAll = function (where, statusId) {
    $scope.busy = true;
    $scope.list = [];
    where = where || {};
    if ('##user.type.id##' == 2) {
      where['doctor.id'] == site.toNumber('##user.id##');
    }
    if (statusId) {
      where['status.id'] = statusId;
    }
    if ($scope.today) {
      where['date'] = new Date();
    } else {
      delete where['date'];
    }
    console.log(where);
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSignificantSignsList = function () {
    $scope.busy = true;
    $scope.significantSignsList = [];
    $http({
      method: 'POST',
      url: '/api/significantSigns/all',
      data: {
        where: { active: true },
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
          $scope.significantSignsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOtherConditionsList = function () {
    $scope.busy = true;
    $scope.otherConditionsList = [];
    $http({
      method: 'POST',
      url: '/api/otherConditions/all',
      data: {
        where: { active: true },
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
          $scope.otherConditionsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getChiefComplaintsList = function () {
    $scope.busy = true;
    $scope.chiefComplaintsList = [];
    $http({
      method: 'POST',
      url: '/api/chiefComplaints/all',
      data: {
        where: { active: true },
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
          $scope.chiefComplaintsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDiagnosesList = function () {
    $scope.busy = true;
    $scope.diagnosesList = [];
    $http({
      method: 'POST',
      url: '/api/diagnoses/all',
      data: {
        where: { active: true },
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
          $scope.diagnosesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPatientRecommendationsList = function () {
    $scope.busy = true;
    $scope.patientRecommendationsList = [];
    $http({
      method: 'POST',
      url: '/api/patientRecommendations/all',
      data: {
        where: { active: true },
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
          $scope.patientRecommendationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPatientEducationsList = function () {
    $scope.busy = true;
    $scope.patientEducationsList = [];
    $http({
      method: 'POST',
      url: '/api/patientEducations/all',
      data: {
        where: { active: true },
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
          $scope.patientEducationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getFoodsList = function () {
    $scope.busy = true;
    $scope.foodsList = [];
    $http({
      method: 'POST',
      url: '/api/foods/all',
      data: {
        where: { active: true },
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
          $scope.foodsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDrinksList = function () {
    $scope.busy = true;
    $scope.drinksList = [];
    $http({
      method: 'POST',
      url: '/api/drinks/all',
      data: {
        where: { active: true },
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
          $scope.drinksList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addDoctorReccomend = function (name, code) {
    $scope.error = '';
    $scope.item.doctorReccomendList = $scope.item.doctorReccomendList || [];
    if ($scope.item[name] && $scope.item[name].id) {
      if (!$scope.item.doctorReccomendList.some((s) => s.id === $scope.item[name].id && code == s.code)) {
        $scope.item.doctorReccomendList.push({
          id: $scope.item[name].id,
          name: $scope.item[name].name,
          code: code,
        });
      }
      delete $scope.item[name];
    } else {
      return;
    }
  };

  $scope.addPatientReccomend = function (name, code) {
    $scope.error = '';
    $scope.item.patientReccomendList = $scope.item.patientReccomendList || [];
    if ($scope.item[name] && $scope.item[name].id) {
      if (!$scope.item.patientReccomendList.some((s) => s.id === $scope.item[name].id && code == s.code)) {
        $scope.item.patientReccomendList.push({
          id: $scope.item[name].id,
          nameEn: $scope.item[name].nameEn,
          nameAr: $scope.item[name].nameAr,
          code: code,
        });
      }
      delete $scope.item[name];
    } else {
      return;
    }
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
          image: 1,
          nameEn: 1,
          nameAr: 1,
          specialty: 1,
          hospitalCenter: 1,
          doctorType: 1,
          nationality: 1,
          clinicExt: 1,
          mobile: 1,
          homeTel: 1,
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

  $scope.showSearch = function () {
    $scope.error = '';
    site.showModal($scope.modalSearchID);
  };

  $scope.searchAll = function () {
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
    $scope.search = {};
  };

  $scope.getAll({ date: new Date() });
  $scope.getDoctorsList();
  $scope.getChiefComplaintsList();
  $scope.getSignificantSignsList();
  $scope.getOtherConditionsList();
  $scope.getDiagnosesList();
  $scope.getPatientRecommendationsList();
  $scope.getPatientEducationsList();
  $scope.getDrinksList();
  $scope.getFoodsList();
});
