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
});
