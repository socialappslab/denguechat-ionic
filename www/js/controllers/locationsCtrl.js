angular.module("starter.controllers").controller("locationsCtrl", [
  "$scope",
  "Location",
  "$ionicLoading",
  "$ionicModal",
  "User",
  "$state",
  function(
    $scope,
    Location,
    $ionicLoading,
    $ionicModal,
    User,
    $state
  ) {
    $scope.locations = [];
    $scope.state = { firstLoad: true, loadingGeo: false };
    $scope.params = { search: "" };
    $scope.user = {};

    User.get().then(function(user) {
      $scope.user = user;
      $scope.neighborhoods = user.neighborhoods;
      $scope.location = {
        neighborhood_id: user.neighborhood.id,
        questions: user.neighborhood.questions,
        last_visited_at: new Date(),
        visits_count: 0
      };
    });

    // Triggered only once when the view is loaded.
    // http://ionicframework.com/docs/api/directive/ionView/
    $scope.$on("$ionicView.loaded", function() {
      $scope.loadAllLocations();
    });

    $scope.loadAllLocations = function() {
      $ionicLoading.show({ hideOnStateChange: true });

      Location.getAll()
        .then(function(locations) {
          $scope.locations = locations;
          $scope.state.loading = false;
          $scope.state.firstLoad = false;
          $ionicLoading.hide();
        })
        .catch(function(res) {
          $ionicLoading.hide();
          $scope.state.loading = false;
          $scope.state.firstLoad = false;
        });
    };

    $scope.searchByAddress = function() {
      $ionicLoading.show({ hideOnStateChange: true });

      console.log($scope.params.search);

      $scope.locations = [];
      Location.search($scope.params.search).then(
        function(response) {
          console.log(response);
          $scope.locations = response.rows;
          $ionicLoading.hide();
        },
        function(response) {
          $ionicLoading.hide();
        }
      );
    };

    $scope.refresh = function() {
      $ionicLoading.show({ hideOnStateChange: true });

      Location.getAllFromCloud()
        .then(function(response) {
          return Location.getAll().then(function(locations) {
            $scope.locations = locations;
          });
        })
        .then(function() {
          $scope.state.firstLoad = false;
          $scope.$broadcast("scroll.refreshComplete");
          $ionicLoading.hide();
        })
        .catch(function(res) {
          navigator.notification.alert(
            JSON.stringify(res),
            null,
            "Problem getting all locations from server",
            "OK"
          );
          // $scope.$emit(denguechat.env.error, response)
        });
    };

    $scope.$on(denguechat.env.data.refresh, function() {
      $scope.state.loading = true;
      $scope.refresh();
    });

    $scope.showNewLocationModal = function() {
      // Create the login modal that we will use later
      return $ionicModal
        .fromTemplateUrl("templates/locations/new_location.html", {
          scope: $scope,
          animation: "slide-in-up",
          focusFirstInput: true,
          backdropClickToClose: false,
          hardwareBackButtonClose: false
        })
        .then(function(modal) {
          $scope.modal = modal;
          modal.show();

          $scope.state.loadingGeo = true;
          $scope.loadGeo();
        });
    };

    $scope.closeNewLocationModal = function() {
      $scope.modal.hide().then(function() {
        $scope.modal.remove();
      });
    };

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
      if (!$scope.location.address) {
        navigator.notification.alert(
          "Address can't be blank",
          null,
          "Problem saving",
          "OK"
        );
        return;
      }

      Location.search($scope.location.address).then(function(result) {
        if (result.docs.length > 0) {
          navigator.notification.alert(
            "A location with this address already exists",
            null,
            "Problem saving",
            "OK"
          );
          return;
        }

        $ionicLoading.show();
        doc_id = Location.documentID($scope.user, $scope.location);
        $scope.location.user_id = $scope.user.id;
        $scope.location.visits = [];
        $scope.location.questions = $scope.user.location_questionnaire;
        Location.save(doc_id, $scope.location, {
          remote: true,
          synced: false
        }).then(
          function(response) {
            $scope.location = {};

            $ionicLoading.hide().then(function() {
              $scope.modal.hide().then(function() {
                $scope.modal.remove();
                $state.go("app.location", { id: doc_id });
              });
            });
          },
          function(response) {
            $scope.$emit(denguechat.env.error, {
              error: "Something went wrong. Please try again."
            });
            $ionicLoading.hide();
          }
        );
      });
    };

    $scope.$watch("params.search", function(newValue, oldValue) {
      if (newValue == "" || newValue == null) {
        $scope.loadAllLocations();
      }
    });

    var markers = [];
    var placeMarkerAndPanTo = function(latLng) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      var marker = new google.maps.Marker({
        position: latLng,
        map: $scope.map
      });
      markers.push(marker);
    };

    $scope.loadGeo = function() {
      // Map-related tasks
      var options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 };

      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.state.loadingGeo = false;
        $scope.location.latitude = position.coords.latitude;
        $scope.location.longitude = position.coords.longitude;

        var latLng = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        $scope.loadMap(latLng);
      }, function(error) {
        $scope.state.loadingGeo = false;        
        err = JSON.stringify(error);
        navigator.notification.alert(
          "ERROR: " +
            err +
            " | Could not get the current position. Either GPS signals are weak or GPS has been switched off",
          null,
          "GPS issues",
          "OK"
        );
      }, options);
    };

    $scope.loadMap = function(latLng) {
      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );
      placeMarkerAndPanTo(latLng);

      $scope.map.addListener("click", function(e) {
        $scope.location.latitude = e.latLng.lat();
        $scope.location.longitude = e.latLng.lng();
        $scope.$apply();
        placeMarkerAndPanTo(e.latLng);
      });
    };
  }
]);
