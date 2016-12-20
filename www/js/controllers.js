angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicHistory, $timeout, Participant) {

  $scope.logout = function() {
    Participant.logout().then(function() {
      $ionicHistory.clearCache().then(function(response) {
        $scope.$emit(clovi.env.auth.failure, {})
      })
    })
  };
})
