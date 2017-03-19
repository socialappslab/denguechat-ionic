angular.module('starter.controllers')
.controller('editVisitCtrl', ['$scope', '$state', 'Inspection', '$ionicLoading', '$ionicHistory', "Visit", "Location", function($scope, $state, Inspection, $ionicLoading, $ionicHistory, Visit, Location) {
  $scope.visit = {};

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Cargando visita...", hideOnStateChange: true})

    Location.get($state.params.id).then(function(loc) {
      return Visit.get($state.params.visit_id).then(function(response) {
        $scope.visit                  = response
        $scope.visit.location         = {id: loc.id, pouchdb_id: loc._id, address: loc.address}
        $scope.visit.visited_at       = new Date($scope.visit.visited_at)
      })
    }).then(function() {
      return $ionicLoading.hide()
    })
  })

  $scope.update = function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Guardar visita...", hideOnStateChange: true})

    Visit.save($state.params.visit_id, $scope.visit, {remote: true}).then(function(response) {
      $ionicLoading.hide().then(function() {
        $ionicHistory.goBack();
      })
    })
  }
}])
