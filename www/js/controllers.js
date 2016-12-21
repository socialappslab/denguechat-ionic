angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicHistory, $timeout, User) {

  $scope.logout = function() {
    User.logout().then(function() {
      $ionicHistory.clearCache().then(function(response) {
        $scope.$emit(denguechat.env.auth.failure, {})
      })
    })
  };
})
