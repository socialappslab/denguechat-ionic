angular
  .module('starter.controllers', [])
  .controller('AppCtrl', function ($scope, $state, $ionicHistory, $timeout, User) {

    $scope.logout = function () {
      User.destroy().then(function (doc) {
        $ionicHistory.clearCache().then(function (response) {
          $scope.$emit(denguechat.env.auth.failure, {})
        })
      })
    };
  })
