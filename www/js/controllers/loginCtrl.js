angular.module('starter.controllers')
.controller('loginCtrl', function($scope, User) {
  $scope.state = {loading: false, error: null}
  $scope.user  = {}
  $scope.view  = "login"

  $scope.toggleTo = function(name) {
    $scope.state.error = null
    $scope.view        = name
  }

  $scope.login = function(){
    $scope.state = {loading: true, error: null}
    User.session($scope.user.username, $scope.user.password).then(function(response) {
      User.set(response.data.user)
      $scope.$emit(denguechat.env.auth.success, {token: response.data.token})
    }, function(error) {
      $scope.state.error = error.data.message
    }).finally(function() {
      $scope.state.loading = false;
    })
  }

  $scope.signup = function(){
    if ($scope.user.password != $scope.user.password_confirmation) {
      $scope.state.error = "Passwords do not match"
      return
    }

    $scope.state.loading = true
    $scope.state.error   = true

    User.create($scope.user.username, $scope.user.password).then(function(response) {
      $scope.login()
    }, function(error) {
      if (error.data.errors.username)
        $scope.state.error = "Username " + error.data.errors.username[0]
      else if (error.data.errors.password)
          $scope.state.error = "Password " + error.data.errors.password[0]
    }).finally(function() {
      $scope.state.loading = false;
    })
  }
})
