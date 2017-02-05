angular.module('starter.controllers')
.controller('editLocationCtrl', ['$scope', "$state", 'User', 'Location', '$ionicModal', '$rootScope', '$ionicLoading', "$cordovaGeolocation", function($scope, $state, User, Location, $ionicModal, $rootScope, $ionicLoading, $cordovaGeolocation) {
  $scope.state         = {loading: false};

  User.get().then(function(user) {
    $scope.neighborhoods = user.neighborhoods;
  })

  $scope.$on("$ionicView.loaded", function() {

    Location.get($state.params.id).then(function(loc) {
      $scope.location = loc

      $scope.state.loadingGeo = true;
      $scope.loadGeo()
    })
  })


  $scope.update = function() {
    $ionicLoading.show({hideOnStateChange: true})

    Location.save($state.params.id, $scope.location, {remote: true, synced: false}).then(function(response) {
      $ionicLoading.hide()
    }).catch(function(response) {
      $ionicLoading.hide()
      $scope.$emit(denguechat.env.error, {error: "Something went wrong. Please try again."})
    })
  }




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
    var options = {timeout: 10000, enableHighAccuracy: true};

    var latLng = new google.maps.LatLng($scope.location.latitude, $scope.location.longitude);
    $scope.loadMap(latLng)
    $scope.state.loadingGeo = false;
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
