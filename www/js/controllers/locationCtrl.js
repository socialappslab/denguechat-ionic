angular.module('starter.controllers')
.controller('locationCtrl', ['$scope', "$state", 'Location', '$ionicHistory', "$ionicSlideBoxDelegate", 'LocationQuiz', '$ionicLoading', "$ionicModal", "Visit", function($scope, $state, Location, $ionicHistory, $ionicSlideBoxDelegate, LocationQuiz, $ionicLoading, $ionicModal, Visit) {
  $scope.state    = {firstLoad: true, pageIndex: 0};
  $scope.params   = {search: ""};
  $scope.visit    = {location_id: $state.params.id}
  $scope.location = {}

  $scope.createVisit = function() {
    $ionicLoading.show()

    Visit.create($scope.visit).then(function(response) {
      $ionicLoading.hide().then(function() {
        $scope.closeNewVisitModal()
      })
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
      $ionicLoading.hide()
    })
  }

  $scope.refresh = function() {
    // TODO
    // $ionicHistory.removeBackView()

    $scope.state.loading = true
    Location.getFromCloud($scope.location).then(function(response) {
      console.log(response)
      // Let's parse the dates.
      // for (var i=0; i < response.location.questions.length; i++) {
      //   if (response.location.questions[i].type == "date" && response.location.questions[i].answer)
      //     response.location.questions[i].answer = new Date(response.location.questions[i].answer)
      // }
      //
      // $scope.visits    = response.location.visits
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.state.loading   = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.saveQuestions = function() {
    $ionicLoading.show({hideOnStateChange: true})

    Location.save($state.params.id, $scope.location, {remote: true}).then(function(response) {
      $ionicLoading.hide()
    })
  }

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.loading = true
    $scope.refresh();
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    Location.get($state.params.id).then(function(loc) {
      $scope.location = loc

      Visit.getAll($scope.location.visits).then(function(visits) {
        $scope.visits = visits
      })
    })

    // Location.get($state.params.id).then(function(doc) {
    //   $scope.visits    = []
    //
    //   $scope.location = doc
    //   $scope.$broadcast('scroll.refreshComplete');
    //   $scope.state.loading   = false
    //   $scope.state.firstLoad = false
    // }).catch(function(error) {
    //   console.log(error)
    //   console.log("^ ERROR")
    //   $scope.$broadcast('scroll.refreshComplete');
    //   $scope.state.loading = false
    //   $scope.state.firstLoad = false
    // })
  })


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

  $scope.showNewVisitModal = function() {
    // Create the login modal that we will use later
    return $ionicModal.fromTemplateUrl('templates/locations/new_visit.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
      modal.show()
    });
  }

  $scope.closeNewVisitModal = function() {
    $scope.modal.hide().then(function() {
      $scope.modal.remove();
    })
  }

}])
