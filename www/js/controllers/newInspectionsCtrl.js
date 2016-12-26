angular.module('starter.controllers')
.controller('newInspectionsCtrl', ['$scope', '$state', 'Inspection', '$ionicLoading', '$ionicHistory', function($scope, $state, Inspection, $ionicLoading, $ionicHistory) {
  $scope.inspection = {visit_id: $state.params.id, protected: 0, chemically_treated: 0, larvae: 0, pupae: 0};
  $scope.breeding_sites = Inspection.breeding_sites;

  $scope.loadCamera = function() {
    console.log("Loads camera...")
  }

  $scope.create = function() {
    $ionicLoading.show()

    Inspection.create($scope.inspection).then(function(response) {
      console.log(response)
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
