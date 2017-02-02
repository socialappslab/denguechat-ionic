angular.module('starter.controllers')
.controller('locationsCtrl', ['$scope', 'Location', "$ionicLoading", "$ionicModal", "User", "$state", function($scope, Location, $ionicLoading, $ionicModal, User, $state) {
  $scope.neighborhoods = User.get().neighborhoods;
  $scope.locations = [];
  $scope.state  = {firstLoad: true};
  $scope.params = {search: ""};
  $scope.location      = {visits: [], neighborhood_id: User.get().neighborhood.id, last_visited_at: new Date(), visits_count: 0};


  $scope.searchByAddress = function() {
    $scope.locations     = []
    $scope.state.loading = true
    Location.search($scope.params.search).then(function(response) {
      $scope.locations = response.data.locations
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading = false;
    });
  }

  $scope.refresh = function() {
    $ionicLoading.show({hideOnStateChange: true})

    Location.getAllFromCloud().then(function(response) {
      Location.getAll().then(function(locations) {
        $scope.locations = locations
        $ionicLoading.hide()
      })

    }, function(response) {
      $ionicLoading.hide()
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
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
    Location.getAll().then(function(locations) {
      $scope.locations = locations
      $scope.$broadcast('scroll.refreshComplete');
      $scope.state.loading   = false
      $scope.state.firstLoad = false
    }).catch(function(error) {
      $scope.$broadcast('scroll.refreshComplete');
      $scope.state.loading = false
      $scope.state.firstLoad = false
    })
  })

  $scope.showNewLocationModal = function() {
    // Create the login modal that we will use later
    return $ionicModal.fromTemplateUrl('templates/locations/new_location.html', {
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

  $scope.closeNewLocationModal = function() {
    $scope.modal.hide().then(function() {
      $scope.modal.remove();
    })
  }



  // Map modal.
  $scope.loadMap = function() {
    modal = $ionicModal.fromTemplateUrl('templates/map.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }).then(function(modal) {
      $scope.mapModal = modal;
    });

    modal.then(function() {
      $scope.mapModal.show();
    })
  }

  $scope.closeLogin = function() {
    $scope.mapModal.hide();
  };


  $scope.create = function() {
    // $scope.state.loading = true;
    //
    // Location.create($scope.location).then(function(response) {
    //   $state.go("app.location", {id: response.data.id})
    // }, function(response) {
    //   $scope.$emit(denguechat.env.error, {error: response})
    // }).finally(function() {
    //  $scope.state.loading   = false;
    // });

    $ionicLoading.show()

    doc_id = Location.documentID($scope.location)
    Location.save(doc_id, $scope.location, {remote: true, synced: false}).then(function(response) {
      $ionicLoading.hide().then(function() {
        $scope.modal.hide().then(function() {
          $scope.modal.remove();
          $state.go("app.location", {id: doc_id})
        })
      })

    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: "Something went wrong. Please try again."})
      $ionicLoading.hide()
    })
  }

  // $scope.$watch("params.search", function(newValue, oldValue) {
  //   if (newValue == "" || newValue == null) {
  //     $scope.refresh()
  //   }
  // })
}])
