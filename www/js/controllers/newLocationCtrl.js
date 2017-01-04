angular.module('starter.controllers')
.controller('newLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', function($scope, $state, User, Location, $ionicModal, $rootScope) {
  $scope.neighborhoods = User.get().neighborhoods;
  $scope.location      = {neighborhood_id: User.get().neighborhood.id};
  $scope.state         = {loading: false};

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


  $scope.create = function() {
    $scope.state.loading = true;

    Location.create($scope.location).then(function(response) {
      $state.go("app.location", {id: response.data.id})
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading   = false;
    });
  }
}])
