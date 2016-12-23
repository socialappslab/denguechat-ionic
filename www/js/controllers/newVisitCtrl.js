angular.module('starter.controllers')
.controller('newVisitCtrl', ['$scope', '$state', 'Visit', function($scope, $state, Visit) {
  $scope.visit = {};
  $scope.state = {firstLoad: true};


}])
