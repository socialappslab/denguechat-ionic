angular.module('starter.controllers')
.controller('recordsCtrl', function($scope, Measurement, $ionicPopup) {
  $scope.records = [];
  $scope.state   = {firstLoad: true, moreData: true};

  $scope.refresh = function() {
    Measurement.get().then(function(response) {
      $scope.records = response.data.measurements
    }, function(error) {
      $ionicPopup.alert({
        title: 'Error',
        template: error.data.error,
        buttons: [ { text: 'OK' }]
      });
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.loadMore = function() {
    Measurement.getWithOffset($scope.records.length).then(function(response) {
      newMeasurements = response.data.measurements;
      if (newMeasurements.length == 0)
        $scope.state.moreData = false;
      else
        $scope.records = $scope.records.concat(response.data.measurements)

    }, function(error) {
      $ionicPopup.alert({
        title: 'Error',
        template: error.data.error,
        buttons: [ { text: 'OK' }]
      });
    }).finally(function() {
     $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
})
.controller('recordCtrl', function($scope, $state, Measurement, $ionicPopup) {
  $scope.record = {};
  $scope.state  = {firstLoad: true};

  $scope.refresh = function() {
    Measurement.get($state.params.id).then(function(response) {
      $scope.measurement = response.data
    }, function(error) {
      $ionicPopup.alert({
        title: 'Error',
        template: error.data.error,
        buttons: [ { text: 'OK' }]
      });
    }).finally(function() {
      $scope.state.firstLoad = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
})
