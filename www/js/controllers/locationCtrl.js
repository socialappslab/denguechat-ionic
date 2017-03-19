angular.module('starter.controllers')
.controller('locationCtrl', ['$scope', "$state", 'Location', '$ionicLoading', "moment", '$ionicHistory', "$ionicSlideBoxDelegate", 'LocationQuiz',"$ionicModal", "Visit", function($scope, $state, Location, $ionicLoading, moment, $ionicHistory, $ionicSlideBoxDelegate, LocationQuiz, $ionicModal, Visit) {
  $scope.state    = {firstLoad: true, pageIndex: 0};
  $scope.params   = {search: ""};
  $scope.visit    = {}
  $scope.location = {}

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Cargando hogares...", hideOnStateChange: true})

    Location.get($state.params.id).then(function(loc) {
      $scope.location       = loc
      $scope.visit.location = {id: loc.id, pouchdb_id: loc._id, address: loc.address}

      if (!$scope.location.visits || $scope.location.visits.length == 0) {
        $scope.visits = []
        $ionicLoading.hide();
      } else {
        Visit.getAll($scope.location.visits).then(function(visits) {
          $scope.visits = visits
          console.log(visits)
          $ionicLoading.hide();
        })
      }
    })
  })

  $scope.createVisit = function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Creando la visita...", hideOnStateChange: true})

    doc_id = Visit.documentID($state.params.id, $scope.visit);
    Visit.save(doc_id, $scope.visit, {remote: true, synced: false}).then(function(response) {
      if ($scope.location.visits)
        $scope.location.visits.push(doc_id)
      else
        $scope.location.visits = [doc_id]

      Location.save($state.params.id, $scope.location, {remote: false}).then(function(res) {
        $ionicLoading.hide().then(function() {
          $scope.closeNewVisitModal()
          $state.reload()
        })
      }, function(err) {console.log(err)})
    }, function(response) {
      console.log(response)
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

      $scope.state.firstLoad = false;
      $scope.state.loading   = false;
      $scope.$broadcast('scroll.refreshComplete');

    }, function(response) {
      $scope.state.firstLoad = false;
      $scope.state.loading   = false;
      $scope.$broadcast('scroll.refreshComplete');

      $scope.$emit(denguechat.env.error, {error: response})
    })
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
