angular.module('starter.controllers')
.controller('locationCtrl', ['$scope', "$state", 'Location', '$ionicHistory', "$ionicSlideBoxDelegate", 'LocationQuiz', '$ionicLoading', function($scope, $state, Location, $ionicHistory, $ionicSlideBoxDelegate, LocationQuiz, $ionicLoading) {
  $scope.location = {};
  $scope.state    = {firstLoad: true, pageIndex: 0};
  $scope.params   = {search: ""};

  $scope.changeTimeline = function(pageIndex) {
    $scope.state.pageIndex = pageIndex
  }

  $scope.transitionToPageIndex = function(pageIndex) {
    $scope.state.pageIndex = pageIndex
    $ionicSlideBoxDelegate.slide(pageIndex);
  }

  $scope.shouldDisplay = function(q) {
    return LocationQuiz.shouldDisplay(q, $scope.location.questions)
  }

  $scope.refresh = function() {
    // TODO
    // $ionicHistory.removeBackView()

    $scope.state.loading = true
    Location.get($state.params.id).then(function(response) {
      // Let's parse the dates.
      for (var i=0; i < response.data.location.questions.length; i++) {
        if (response.data.location.questions[i].type == "date" && response.data.location.questions[i].answer)
          response.data.location.questions[i].answer = new Date(response.data.location.questions[i].answer)
      }

      $scope.location  = response.data.location


      $scope.visits    = response.data.location.visits
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.state.loading   = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.saveQuestions = function() {
    $ionicLoading.show()
    Location.updateQuestions($scope.location).then(function(response) {
      console.log(response)
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
      $ionicLoading.hide()
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
