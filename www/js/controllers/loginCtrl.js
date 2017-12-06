angular
  .module("starter.controllers")
  .controller("loginCtrl", function($scope, User, cordovaHTTP) {
    $scope.state = { loading: false, error: null };
    $scope.user = {};
    $scope.view = "login";

    $scope.toggleTo = function(name) {
      $scope.state.error = null;
      $scope.view = name;
    };

    $scope.login = function() {
      $scope.state = { loading: true, error: null };

      cordovaHTTP.acceptAllCerts(true).then(
        function() {
          User.session($scope.user.username, $scope.user.password)
            .then(function(response) {
              var parsedData = JSON.parse(response.data);
              var user = parsedData.user;
              return User.save(user).then(function(doc) {
                $scope.$emit(denguechat.env.auth.success, {});
                $scope.state.loading = false;
              });
            })
            .catch(function(res) {
              $scope.$emit(denguechat.error, res);
              $scope.state.loading = false;
            });
        },
        function(response) {
          $scope.$emit(denguechat.error, {});
        }
      );
    };

    $scope.signup = function() {
      if ($scope.user.password != $scope.user.password_confirmation) {
        $scope.state.error = "Passwords do not match";
        return;
      }

      $scope.state.loading = true;
      $scope.state.error = true;

      User.create($scope.user.username, $scope.user.password).then(
        function(response) {
          console.log(JSON.stringify(response));
          response.data = JSON.parse(response.data);
          $scope.login();
          $scope.state.loading = false;
        },
        function(error) {
          error.data = JSON.parse(error.data);
          if (error.data.errors.username)
            $scope.state.error = "Username " + error.data.errors.username[0];
          else if (error.data.errors.password)
            $scope.state.error = "Password " + error.data.errors.password[0];
          $scope.state.loading = false;
        }
      );
    };
  });
