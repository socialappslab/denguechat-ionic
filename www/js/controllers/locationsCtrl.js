angular.module('starter.controllers')
.controller('locationsCtrl', ['$scope', 'Location', "$ionicLoading", "$ionicModal", "User", "$state", "$cordovaGeolocation", function($scope, Location, $ionicLoading, $ionicModal, User, $state, $cordovaGeolocation) {
  $scope.locations = [];
  $scope.state  = {firstLoad: true, loadingGeo: false};
  $scope.params = {search: ""};


  User.get().then(function(user) {
    $scope.neighborhoods = user.neighborhoods;
    $scope.location      = {neighborhood_id: user.neighborhood.id, questions: user.neighborhood.questions, last_visited_at: new Date(), visits_count: 0}
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $scope.loadAllLocations()
  })

  $scope.loadAllLocations = function() {
    $ionicLoading.show({hideOnStateChange: true})

    Location.getAll().then(function(locations) {
      $scope.locations = locations
      $scope.state.loading   = false
      $scope.state.firstLoad = false;
      $ionicLoading.hide();
    }, function(res) {
      $scope.state.loading   = false
      $scope.state.firstLoad = false;
      $ionicLoading.hide();
    })
  }


  $scope.searchByAddress = function() {
    $ionicLoading.show({hideOnStateChange: true})

    console.log($scope.params.search)

    $scope.locations     = []
    Location.search($scope.params.search).then(function(response) {
      console.log(response)
      $scope.locations = response.rows;
      $ionicLoading.hide();
    }, function(response) {
      $ionicLoading.hide();
    });
  }

  $scope.refresh = function() {
    $ionicLoading.show({hideOnStateChange: true})

    Location.getAllFromCloud().then(function(response) {
      Location.getAll().then(function(locations) {
        console.log("LOcation.getALl() returning...")
        console.log(locations)
        $scope.locations = locations
        $ionicLoading.hide()
        $scope.state.firstLoad = false;
        $scope.$broadcast('scroll.refreshComplete');
      }, function(er) {console.log(JSON.stringify(er))})

    }, function(response) {
      $scope.state.firstLoad = false;
      $scope.$broadcast('scroll.refreshComplete');
      $ionicLoading.hide()
      $scope.$emit(denguechat.env.error, {error: response})
    });
  }

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.loading = true
    $scope.refresh();
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

      $scope.state.loadingGeo = true;
      $scope.loadGeo()

    });
  }

  $scope.closeNewLocationModal = function() {
    $scope.modal.hide().then(function() {
      $scope.modal.remove();
    })
  }



  // Map modal.
  // $scope.loadMap = function() {
  //   modal = $ionicModal.fromTemplateUrl('templates/map.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up',
  //     focusFirstInput: true
  //   }).then(function(modal) {
  //     $scope.mapModal = modal;
  //   });
  //
  //   modal.then(function() {
  //     $scope.mapModal.show();
  //   })
  // }

  // $scope.closeLogin = function() {
  //   $scope.mapModal.hide();
  // };


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

  $scope.$watch("params.search", function(newValue, oldValue) {
    if (newValue == "" || newValue == null) {
      $scope.loadAllLocations()
    }
  })




  var markers = []
  var placeMarkerAndPanTo = function(latLng) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    var marker = new google.maps.Marker({
      position: latLng,
      map: $scope.map
    });
    markers.push(marker)
  }

  $scope.loadGeo = function() {
    // Map-related tasks
    var options = {timeout: 10000, maximumAge: 60000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      $scope.location.latitude  = position.coords.latitude
      $scope.location.longitude = position.coords.longitude

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      $scope.loadMap(latLng)
      $scope.state.loadingGeo = false;
    }, function(error){
      err = JSON.stringify(error)
      navigator.notification.alert("ERROR: " + err + " | Could not get the current position. Either GPS signals are weak or GPS has been switched off", null, "GPS issues", "OK")
      $scope.state.loadingGeo = false;
    });
  }

  $scope.loadMap = function(latLng) {
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    placeMarkerAndPanTo(latLng)

    $scope.map.addListener("click", function(e) {
      $scope.location.latitude  = e.latLng.lat();
      $scope.location.longitude = e.latLng.lng();
      $scope.$apply()
      placeMarkerAndPanTo(e.latLng);
    })
  }

}])
