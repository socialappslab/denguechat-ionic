angular.module('starter.controllers')
.controller('newLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', function($scope, $state, User, Location, $ionicModal, $rootScope) {
  $scope.neighborhoods = [];
  $scope.location      = {};
  $scope.state = {loading: false};

  $scope.refresh = function() {
    User.current().then(function(response) {
      $scope.neighborhoods            = response.data.user.neighborhoods
      $scope.location.neighborhood_id = response.data.user.neighborhood.id
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    })
  }
  $scope.refresh()

  $scope.loadMap = function() {
    modal = $ionicModal.fromTemplateUrl('templates/map.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }).then(function(modal) {
      $rootScope.mapModal = modal;
    });

    modal.then(function() {
      $rootScope.mapModal.show();
    })
  }

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
