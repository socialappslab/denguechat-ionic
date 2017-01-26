angular.module('starter.controllers')
.controller('newLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', "$ionicLoading", "$ionicHistory", function($scope, $state, User, Location, $ionicModal, $rootScope, $ionicLoading, $ionicHistory) {
  $scope.neighborhoods = User.get().neighborhoods;
  $scope.location      = {neighborhood_id: User.get().neighborhood.id, last_visited_at: new Date(), visits_count: 0};
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
    // $scope.state.loading = true;
    //
    // Location.create($scope.location).then(function(response) {
    //   $state.go("app.location", {id: response.data.id})
    // }, function(response) {
    //   $scope.$emit(denguechat.env.error, {error: response})
    // }).finally(function() {
    //  $scope.state.loading   = false;
    // });

    $ionicLoading.show()

    doc_id = Location.documentID($scope.location)
    Location.save(doc_id, $scope.location, {remote: true, synced: false}).then(function(response) {
      $ionicLoading.hide().then(function() {
        $ionicHistory.goBack(1)
        $state.go("app.location", {id: doc_id})
      })

    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: "Something went wrong. Please try again."})
      $ionicLoading.hide()
    })
  }
}])
