angular.module('starter.controllers')
.controller('locationCtrl', ['$scope', 'Location', function($scope, Location) {
  $scope.state  = {firstLoad: true};
  $scope.params = {search: ""};

  $scope.refresh = function() {
    $scope.state.loading = true
    Location.get().then(function(response) {
      $scope.location = response.data.location
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
}])
