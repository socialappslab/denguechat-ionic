angular.module('starter.controllers')
.controller('visitsCtrl', ['$scope', 'Visit', function($scope, Visit) {
  $scope.visits = [];
  $scope.state  = {firstLoad: true};

  $scope.refresh = function() {
    Visit.get().then(function(response) {
      $scope.visits = response.data.visits
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.firstLoad = true
    $scope.refresh();
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
}])
