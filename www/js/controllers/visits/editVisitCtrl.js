angular.module('starter.controllers')
.controller('editVisitCtrl', ['$scope', '$state', 'Inspection', '$ionicLoading', '$ionicHistory', "Visit", function($scope, $state, Inspection, $ionicLoading, $ionicHistory, Visit) {
  $scope.visit = {location_address: $state.params.id, visited_at: new Date($state.params.visit_date) };

  $scope.update = function() {
    $ionicLoading.show()

    console.log($state.params)
    Visit.update($state.params.id, $state.params.visit_date, $scope.visit).then(function(response) {
      $ionicLoading.hide().then(function() {
        $ionicHistory.goBack();
      })
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
      $ionicLoading.hide()
    })
  }
}])
