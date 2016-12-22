angular.module('starter.controllers')
.controller('questionsCtrl', ['$scope', "$state", 'Location', function($scope, $state, Location) {
  $scope.location = {};
  $scope.state  = {firstLoad: true};
  $scope.params = {search: ""};

  $scope.refresh = function() {
    $scope.state.loading = true
    Location.get($state.params.id).then(function(response) {
      console.log(response)
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
