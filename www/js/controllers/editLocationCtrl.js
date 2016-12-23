angular.module('starter.controllers')
.controller('editLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', '$ionicLoading', function($scope, $state, User, Location, $ionicModal, $rootScope, $ionicLoading) {
  $scope.location      = {};
  $scope.neighborhoods = Location.neighborhoods;
  $scope.state = {loading: false, viewName: null};

  $scope.refresh = function() {
    $ionicLoading.show()

    Location.get($state.params.id).then(function(response) {
      $scope.location       = response.data.location
      $scope.state.viewName = $scope.location.address
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function(){
      $ionicLoading.hide()
    })
  }
  $scope.refresh()

  // Map modal.
  $scope.loadMap = function() {
    modal = $ionicModal.fromTemplateUrl('templates/map.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }).then(function(modal) {
      $scope.mapModal = modal;
    });

    modal.then(function() {
      $scope.mapModal.show();
    })
  }

  $scope.closeLogin = function() {
    $scope.mapModal.hide();
  };


  $scope.update = function() {
    $ionicLoading.show()

    Location.update($scope.location).then(function(response) {
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $ionicLoading.hide()
    });
  }
}])
