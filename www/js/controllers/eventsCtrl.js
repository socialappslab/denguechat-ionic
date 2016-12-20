angular.module('starter.controllers')
.controller('eventsCtrl', function($scope, Event) {
  $scope.events = [];
  $scope.state  = {firstLoad: true};

  $scope.refresh = function() {
    Event.get().then(function(response) {
      $scope.events = response.data.events
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on(clovi.env.data.refresh, function() {
    $scope.state.firstLoad = true
    $scope.refresh();
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
})
.controller('eventCtrl', function($scope, $state, Event, $http, Participant) {
  $scope.event = [];
  $scope.state = {firstLoad: true};

  $scope.openAppoinmentView = function() {
    window.open(clovi.env.mainURL + $scope.event.appointment_path, '_blank', 'location=yes');
  }

  $scope.cancelAppt = function() {
    http = $http({
      method: "DELETE",
      url:    clovi.env.mainURL + $scope.event.appointment.cancel_path,
      headers: {
       "Clovi-API-V0-Device-Session-Token": Participant.getToken()
      }
    });

    http.then(function(response) {
      $scope.refresh()
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    })
  }

  $scope.refresh = function() {
    Event.get($state.params.slug).then(function(response) {
      $scope.event = response.data
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    }).finally(function() {
      $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on(clovi.env.data.refresh, function() {
    $scope.state.firstLoad = true;
    $scope.refresh();
  })

  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
})
