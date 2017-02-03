angular.module('starter.controllers')
.controller('editVisitCtrl', ['$scope', '$state', 'Inspection', '$ionicLoading', '$ionicHistory', "Visit", "Location", function($scope, $state, Inspection, $ionicLoading, $ionicHistory, Visit, Location) {
  $scope.visit = {};

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({hideOnStateChange: true})

    Location.get($state.params.id).then(function(doc) {
      Visit.get($state.params.visit_id).then(function(response) {
        $scope.visit                  = response
        $scope.visit.location_address = doc.address
        $scope.visit.visited_at       = new Date($scope.visit.visited_at)
        $ionicLoading.hide()
      })
    })
  })

  $scope.update = function() {
    $ionicLoading.show({hideOnStateChange: true})

    Visit.save($state.params.visit_id, $scope.visit, {remote: true}).then(function(response) {
      console.log(response)
      $ionicLoading.hide().then(function() {
        $ionicHistory.goBack();
      })
    })
  }
}])
