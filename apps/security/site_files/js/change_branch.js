app.controller('changeBranch', function ($scope, $http) {
  $scope.busy = false;
  $scope.user = {};

  $scope.login = function (b) {
    $scope.error = '';
    $scope.user.company = b.company;
    $scope.user.branch = b.branch;
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
          usersCount: $scope.user.company.usersCount,
          customersCount: $scope.user.company.customersCount,
          employeesCount: $scope.user.company.employeesCount,
          mobile: $scope.user.company.mobile,
          phone: $scope.user.company.phone,
          host: $scope.user.company.host,
          taxNumber: $scope.user.company.taxNumber,
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
