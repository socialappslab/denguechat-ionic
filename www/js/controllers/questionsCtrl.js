angular.module("starter.controllers").controller("questionsCtrl", [
  "$scope",
  "$state",
  "Location",
  "$ionicLoading",
  function($scope, $state, Location, $ionicLoading) {
    $scope.location = {};
    $scope.questions = [];

    $scope.refresh = function() {
      $ionicLoading.show().then(function() {
        LocationQuiz.questions().then(
          function(response) {
            $scope.questions = response.data.questions;
            $ionicLoading.hide();
          },
          function(response) {
            $scope.$emit(denguechat.env.error, { error: response });
            $ionicLoading.hide();
          }
        );
      });
    };

    $scope.$on("$ionicView.loaded", function() {
      $scope.refresh();
    });
  }
]);
