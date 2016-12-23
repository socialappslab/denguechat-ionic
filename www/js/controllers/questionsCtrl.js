angular.module('starter.controllers')
.controller('questionsCtrl', ['$scope', "$state", 'Location', function($scope, $state, Location) {
  $scope.location = {};
  $scope.questions = [];

  $scope.refresh = function() {
    $ionicLoading.show({}).then(function() {
      LocationQuiz.questions().then(function(response) {
        $scope.questions = response.data.questions
        console.log($scope.questions[0])
      }, function(response) {
        $scope.$emit(denguechat.env.error, {error: response})
      }).finally(function() {
        $ionicLoading.hide();
      });
    })
  }

  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
}])
