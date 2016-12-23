angular.module('starter.controllers')
.controller('locationCtrl', ['$scope', "$state", 'Location', '$ionicHistory', "$ionicSlideBoxDelegate", function($scope, $state, Location, $ionicHistory, $ionicSlideBoxDelegate) {
  $scope.location = {};
  $scope.state    = {firstLoad: true, pageIndex: 0};
  $scope.params   = {search: ""};
  $scope.questions = [];

  $scope.changeTimeline = function(pageIndex) {
    $scope.state.pageIndex = pageIndex
  }

  $scope.transitionToPageIndex = function(pageIndex) {
    $scope.state.pageIndex = pageIndex
    $ionicSlideBoxDelegate.slide(pageIndex);
  }

  $scope.refresh = function() {
    // TODO
    // $ionicHistory.removeBackView()

    $scope.state.loading = true
    Location.get($state.params.id).then(function(response) {
      $scope.location  = response.data.location
      $scope.visits    = response.data.location.visits
      $scope.questions = response.data.location_questions
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
