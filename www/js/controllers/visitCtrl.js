angular.module('starter.controllers')
.controller('visitCtrl', ['$scope', '$state', 'Visit', "$ionicModal", "$ionicLoading", "Inspection", "User", function($scope, $state, Visit, $ionicModal, $ionicLoading, Inspection, User) {
  $scope.visit       = {};
  $scope.inspection  = {report: {}};
  $scope.inspections = []

  $scope.$on("$ionicView.loaded", function() {
    // alert("LOADED")
    $ionicLoading.show({hideOnStateChange: true})

    User.get().then(function(user) {
      $scope.breeding_sites = user.breeding_sites
    });

    Visit.get($state.params.visit_id).then(function(response) {
      $scope.visit               = response
      $scope.inspection.visit_id = $scope.visit.id

      if (!response.inspections || response.inspections.length == 0) {
        $scope.inspections = []
        $ionicLoading.hide()
      } else {
        Inspection.getAll(response.inspections).then(function(inspections) {
          $ionicLoading.hide()
          $scope.inspections = inspections
          $scope.$apply()
        })
      }
    })
  })

  // $scope.refresh = function() {
  //   Visit.get($state.params.location_id, $state.params.visit_date, $state.params.visit_id).then(function(response) {
  //     $scope.visit = response.visit
  //   }, function(response) {
  //     $scope.$emit(denguechat.env.error, {error: response})
  //   }).finally(function() {
  //     $scope.state.firstLoad = false;
  //     $scope.$broadcast('scroll.refreshComplete');
  //   });
  // }

  $scope.showNewInspectionModal = function() {
    // Create the login modal that we will use later
    return $ionicModal.fromTemplateUrl('templates/inspections/new.html', {
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

  $scope.closeNewInspectionModal = function() {
    $scope.modal.hide().then(function() {
      $scope.modal.remove();
    })
  }

  $scope.createInspection = function() {
    $ionicLoading.show({hideOnStateChange: true})

    console.log("Saving inspection...")

    $scope.inspection.created_at = (new Date()).toISOString()
    $scope.inspection.color      = Inspection.color($scope.inspection)
    $scope.inspection.position   = $scope.inspections.length + 1

    console.log("About to save inspection:")
    console.log(JSON.stringify($scope.inspection))

    doc_id = Inspection.documentID($state.params.id, $state.params.visit_id, $scope.inspection)
    console.log("DOC ID created: " + doc_id)
    Inspection.save(doc_id, $scope.inspection, {remote: true, synced: false}).then(function(response) {
      console.log("Saved!")

      $scope.inspection._id = doc_id
      $scope.inspections.push($scope.inspection)

      if (!$scope.visit.inspections || $scope.visit.inspections.length == 0) {
        $scope.visit.inspections = [doc_id]
      } else {
        $scope.visit.inspections.push(doc_id)
      }

      console.log("Saving Visit...")
      Visit.save($state.params.visit_id, $scope.visit, {remote: false}).then(function(res) {
        console.log("Visit saved!")
        $scope.inspection = {};

        $ionicLoading.hide().then(function() {
          console.log("Close inspection modal...")
          $scope.closeNewInspectionModal()
        })
      }, function(err) {
        console.log("Error saving visit: ")
        console.log(JSON.stringify(err))
      })
    }, function(err) {
      console.log("Error saving Inspection:")
      console.log(JSON.stringify(err))
    })
  }

  $scope.loadCamera = function() {
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.inspection.before_photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(response) {
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }


  // $scope.$on(denguechat.env.data.refresh, function() {
  //   $scope.state.firstLoad = true;
  //   $scope.refresh();
  // })

  // $scope.$on("$ionicView.loaded", function() {
  //   $scope.refresh();
  // })
}] )
