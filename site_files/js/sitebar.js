app.controller('sitetop', ($scope, $http) => {
  $scope.register = function () {
    site.showModal('#registerModal');
  };

  $scope.login = function () {
    site.showModal('#loginModal');
  };

  $scope.logout = function () {
    $scope.error = '';
    $scope.busy = true;

    $http.post('/api/user/logout').then(
      function (response) {
        if (response.data.done) {
          window.location.href = '/';
        } else {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
      },
      function (error) {
        $scope.busy = false;
        $scope.error = error;
      }
    );
  };

  $scope.login = function (b) {
    $scope.error = '';
    $scope.user = {
      company: b.company,
      branch: b.branch,
    };

    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/user/change-branch',
      data: {
        $encript: '123',
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

  $scope.changeLang = function (lang) {
    $http({
      method: 'POST',
      url: '/x-language/change',
      data: {
        name: lang,
      },
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(true);
      }
    });
  };
  $scope.loadUserBranches = function () {
    $scope.companyList = [];

    $http({
      method: 'POST',
      url: '/api/user/branches/all',
      data: {
        where: { email: '##user.email##' },
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
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.loadUserBranches();
});
