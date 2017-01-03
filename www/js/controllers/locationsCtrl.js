angular.module('starter.controllers')
.controller('locationsCtrl', ['$scope', 'Location', function($scope, Location) {
  $scope.locations = [];
  $scope.state  = {firstLoad: true};
  $scope.params = {search: ""};

  $scope.searchByAddress = function() {
    $scope.locations     = []
    $scope.state.loading = true
    Location.search($scope.params.search).then(function(response) {
      $scope.locations = response.data.locations
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading = false;
    });
  }

  $scope.refresh = function() {
    $scope.state.loading = true
    Location.get().then(function(response) {
      $scope.locations = response.locations
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.state.loading   = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.loading = true
    $scope.refresh();
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })

  $scope.$watch("params.search", function(newValue, oldValue) {
    if (newValue == "" || newValue == null) {
      $scope.refresh()
    }
  })
}])
