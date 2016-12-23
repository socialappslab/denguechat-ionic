angular.module('starter.controllers')
.controller('editLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', function($scope, $state, User, Location, $ionicModal, $rootScope) {
  $scope.location      = {};
  $scope.neighborhoods = Location.neighborhoods;
  $scope.state = {loading: false};

  $scope.refresh = function() {
    $scope.state.loading = true;

    console.log($state.params.id)

    Location.get($state.params.id).then(function(response) {
      $scope.location  = response.data.location
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function(){
      $scope.state.loading = false;
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
    $scope.state.loading = true;

    Location.update($scope.location).then(function(response) {
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading   = false;
    });
  }
}])
