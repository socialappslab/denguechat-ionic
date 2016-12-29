angular.module('starter.controllers')
.controller('visitCtrl', ['$scope', '$state', 'Visit', function($scope, $state, Visit) {
  $scope.visit = {};
  $scope.state = {firstLoad: true};

  $scope.refresh = function() {
    Visit.get($state.params.visit_id).then(function(response) {
      $scope.visit = response.data.visit
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
      $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.firstLoad = true;
    $scope.refresh();
  })

  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
}] )
