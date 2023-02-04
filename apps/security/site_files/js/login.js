app.controller('login', function ($scope, $http) {
    $scope.busy = false;
    $scope.user = {};

    $scope.tryLogin = function (ev) {
        if (ev.which == 13) {
            $scope.login();
        }
    };

    $scope.login = function (b) {
        $scope.error = '';
        const v = site.validated('#loginModal');
        if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
        }

        $scope.user.company = b.company;
        $scope.user.branch = b.branch;

        $scope.busy = true;
        $http({
            method: 'POST',
            url: '/api/user/login',
            data: {
                $encript: '123',
                email: site.to123($scope.user.email),
                password: site.to123($scope.user.password),
                company: site.to123({
                    id: $scope.user.company.id,
                    nameAr: $scope.user.company.nameAr,
                    nameEn: $scope.user.company.nameEn,
                    item: $scope.user.company.item,
                    store: $scope.user.company.store,
                    unit: $scope.user.company.unit,
                    currency: $scope.user.company.currency,
                    users_count: $scope.user.company.users_count,
                    customers_count: $scope.user.company.customers_count,
                    employees_count: $scope.user.company.employees_count,
                    host: $scope.user.company.host,
                    tax_number: $scope.user.company.tax_number,
                }),
                branch: site.to123({
                    code: $scope.user.branch.code,
                    nameAr: $scope.user.branch.nameAr,
                    nameEn: $scope.user.branch.nameEn,
                }),
            },
        }).then(
            function (response) {
                if (response.data.error) {
                    $scope.error = response.data.error;
                    $scope.busy = false;
                }
                if (response.data.done) {
                    window.location.reload(true);
                }
            },
            function (err) {
                $scope.busy = false;
                $scope.error = err;
            }
        );
    };

    $scope.loadUserBranches = function (ev) {
        $scope.companyList = [];

        $http({
            method: 'POST',
            url: '/api/user/branches/all',
            data: {
                where: { email: $scope.user.email },
            },
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.branchList = response.data.list;
                    $scope.companyList = [];
                    $scope.branchList.forEach((b) => {
                        let exist = false;
                        $scope.companyList.forEach((company) => {
                            if (company.id === b.company.id) {
                                exist = true;
                                company.branchList.push(b.branch);
                            }
                        });

                        if (!exist) {
                            b.company.branchList = [b.branch];
                            $scope.companyList.push(b.company);
                        }
                    });
                    if (ev && ev.which === 13 && $scope.branchList.length > 0 && $scope.user.email && $scope.user.password) {
                        $scope.login($scope.branchList[0]);
                    }

                    $scope.$applyAsync();
                }
            },
            function (err) {
                $scope.error = err;
            }
        );
    };
});
