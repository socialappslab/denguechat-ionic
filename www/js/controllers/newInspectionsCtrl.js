angular.module('starter.controllers')
.controller('newInspectionsCtrl', ['$scope', '$state', 'Inspection', '$ionicLoading', '$ionicHistory', "User", function($scope, $state, Inspection, $ionicLoading, $ionicHistory, User) {
  $scope.inspection     = {visit_id: $state.params.id, protected: 0, chemically_treated: 0, larvae: 0, pupae: 0};
  $scope.breeding_sites = User.get().breeding_sites

  $scope.loadCamera = function() {
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.inspection.before_photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(response) {
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }

  $scope.create = function() {
    $ionicLoading.show()

    Inspection.create($scope.inspection).then(function(response) {
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
