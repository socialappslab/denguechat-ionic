angular.module('starter.controllers')
.controller('mapCtrl', ['$scope', "$state", "$rootScope", function($scope, $state, $rootScope) {
  $scope.closeLogin = function() {
    $rootScope.mapModal.hide();
  };
}])
