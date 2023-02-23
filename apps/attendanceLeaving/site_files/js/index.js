app.controller('attendanceLeaving', function ($scope, $http, $timeout) {
    $scope.baseURL = '';
    $scope.appName = 'attendanceLeaving';
    $scope.modalID = '#attendanceLeavingManageModal';
    $scope.modalSearchID = '#attendanceLeavingSearchModal';
    $scope.mode = 'add';
    $scope._search = {};
    $scope.structure = {};
    $scope.item = {};
    $scope.list = [];
    $scope.currentDay = {};

    $scope.showAdd = function (_item) {
        $scope.error = '';
        $scope.mode = 'add';
        $scope.item = { ...$scope.structure, date: new Date() };
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
                    $scope.list.push(response.data.result);
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

    $scope.attendTime = function (type) {
        const now = new Date();
        const attendTime = new Date($scope.item.shiftData.start);
        const leavingTime = new Date($scope.item.shiftData.end);

        if (type == 'attend') {
            $scope.item.attendTime = new Date();

            const attendHours = now.getHours() - attendTime.getHours();
            const attendMinutes = now.getMinutes();
            $scope.item.attendanceTimeDifference = Math.floor(attendHours * 60 + attendMinutes);
        } else if (type == 'leave') {
            $scope.item.leaveDate = new Date();
            const leavingHours = now.getHours() - leavingTime.getHours();
            const leavingMinutes = now.getMinutes();

            $scope.item.leavingTimeDifference = Math.floor(leavingHours * 60 - leavingMinutes);
        } else if (type == 'absence') {
            $scope.item.absence = true;
        }
    };

    $scope.getEmployeeAttend = function () {
        $scope.busy = true;
        if ($scope.item.date && $scope.item.employee) {
            $http({
                method: 'POST',
                url: `${$scope.baseURL}/api/${$scope.appName}/get`,
                data: $scope.item,
            }).then(
                function (response) {
                    $scope.busy = false;

                    if (response.data.done) {
                        $scope.item = response.data.result;
                    }
                },
                function (err) {
                    $scope.busy = false;
                    $scope.error = err;
                }
            );
        }
    };

    $scope.getEmployees = function ($search) {
        if ($search && $search.length < 3) {
            return;
        }
        $scope.busy = true;
        $scope.employeesList = [];
        $http({
            method: 'POST',
            url: '/api/employees/all',
            data: {
                where: { active: true },
                select: {
                    id: 1,
                    code: 1,
                    fullNameEn: 1,
                    fullNameAr: 1,
                    image: 1,
                    fingerprintCode: 1,
                    shift: 1,
                },
                search: $search,
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.employeesList = response.data.list;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.getShiftData = function (_data) {
        if (!_data.date || !_data.employee) {
            return;
        }
        const data = {
            date: _data.date,
            id: _data.employee.shift.id,
        };

        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/jobsShifts/get',
            data,
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.doc) {
                    $scope.item.shiftData = response.data.doc;
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    // $scope.getShift(data);
    // const dayIndex = $scope.item.date.getDay();
    // const dayName = employee.shift.worktimesList?.findIndex((_d) => _d.day.index == dayIndex);
    // if (dayName !== -1) {
    //     const selectedDay = employee.shift.worktimesList[dayName];

    //     $scope.currentDay = {
    //         day: selectedDay.day,
    //         start: selectedDay.start,
    //         end: selectedDay.end,
    //     };
    // }
    // };

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

    $scope.getAll();
    $scope.getNumberingAuto();
    $scope.getEmployees();
});
