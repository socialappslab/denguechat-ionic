angular.module('starter.controllers')
.controller('loginCtrl', function($scope, Participant) {
  $scope.state = {loading: false, name: "login"}
  $scope.user  = {}

  $scope.toggleTo = function(name) {
    $scope.state.error = null
    $scope.state.name  = name
  }

  $scope.login = function(){
    $scope.state = {loading: true, error: null}
    Participant.session($scope.user.email, $scope.user.password).then(function(response) {
      $scope.$emit(clovi.env.auth.success, {token: response.data.device_session.token})
    }, function(error) {
      $scope.state.error = error.data.error
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

    Participant.create($scope.user.email, $scope.user.password).then(function(response) {
      $scope.login()
    }, function(error) {
      if (error.data.errors.email)
        $scope.state.error = "Email " + error.data.errors.email[0]
      else if (error.data.errors.password)
          $scope.state.error = "Password " + error.data.errors.password[0]
    }).finally(function() {
      $scope.state.loading = false;
    })
  }
})
