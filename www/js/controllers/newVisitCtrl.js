angular.module('starter.controllers')
.controller('newVisitCtrl', ['$scope', '$state', 'Inspection', '$ionicLoading', '$ionicHistory', "Visit", function($scope, $state, Inspection, $ionicLoading, $ionicHistory, Visit) {
  $scope.visit = {location_id: $state.params.id};

  $scope.create = function() {
    $ionicLoading.show()

    Visit.create($scope.visit).then(function(response) {
      $ionicLoading.hide().then(function() {
        $ionicHistory.goBack();
      })
    }, function(response) {
      console.log(response)
      $scope.$emit(denguechat.env.error, {error: response})
      $ionicLoading.hide()
    })
  }
}])
