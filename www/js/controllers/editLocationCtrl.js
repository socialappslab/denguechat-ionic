angular.module('starter.controllers')
.controller('editLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', '$ionicLoading', function($scope, $state, User, Location, $ionicModal, $rootScope, $ionicLoading) {
  $scope.location      = {};
  $scope.neighborhoods = User.get().neighborhoods;
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


  $scope.update = function() {
    $ionicLoading.show()

    Location.save($state.params.id, $scope.location, {remote: true, synced: false}).then(function(response) {
      $ionicLoading.hide()
    }).catch(function(response) {
      $ionicLoading.hide()
      $scope.$emit(denguechat.env.error, {error: "Something went wrong. Please try again."})
    })
  }


  $scope.$on("$ionicView.loaded", function() {
    console.log($state.params.id)
    Location.get($state.params.id).then(function(doc) {
      $scope.location = doc
      $scope.$broadcast('scroll.refreshComplete');
      $scope.state.loading   = false
      $scope.state.firstLoad = false
    }).catch(function(error) {
      console.log(error)
      console.log("^ ERROR")
      $scope.$broadcast('scroll.refreshComplete');
      $scope.state.loading = false
      $scope.state.firstLoad = false
    })

  })
}])
