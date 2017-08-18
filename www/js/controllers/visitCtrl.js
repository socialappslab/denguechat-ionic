angular.module('starter.controllers')
.controller('visitCtrl', ['$scope', '$state', 'Visit', "$ionicModal", "$ionicLoading", "Inspection", "User", "$cordovaCamera", "$ionicSlideBoxDelegate", "Questionnaire", function($scope, $state, Visit, $ionicModal, $ionicLoading, Inspection, User, $cordovaCamera, $ionicSlideBoxDelegate, Questionnaire) {
  $scope.visit       = {};
  $scope.inspection  = {};
  $scope.inspections = [];
  $scope.state       = {pageIndex: 0};

  $scope.$on("$ionicView.loaded", function() {
    // alert("LOADED")
    $ionicLoading.show({hideOnStateChange: true})

    User.get().then(function(user) {
      $scope.breeding_sites = user.breeding_sites
    });

    Visit.get($state.params.visit_id).then(function(response) {
      $scope.visit = response

      if ($scope.visit.visited_at)
        $scope.visit.visited_at = new Date($scope.visit.visited_at)

      $scope.inspection.visit = {id: response.id, pouchdb_id: response._id}

      if (!response.inspections || response.inspections.length == 0) {
        $scope.inspections = []
        $ionicLoading.hide()
      } else {
        Inspection.getAll(response.inspections).then(function(inspections) {
          $ionicLoading.hide()
          $scope.inspections = inspections

          _.each($scope.inspections, function(ins) {
            ins.color = Inspection.color(ins)
          })

          $scope.$apply()
        })
      }
    }).catch(function(response) {
      $scope.$emit(denguechat.error, {error: response})
    })
  })

  $scope.shouldDisplay = function(q) {
    return Questionnaire.shouldDisplay(q, $scope.visit.questions)
  }


  $scope.saveQuestions = function() {
    $ionicLoading.show({hideOnStateChange: true})
    Visit.save($state.params.visit_id, $scope.visit, {remote: false}).then(function(response) {
      $ionicLoading.hide()
      $scope.transitionToPageIndex(0)
    })
  }

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
    $scope.inspection.questions  = $scope.user.visit_questionnaire

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
    // $cordovaCamera.getPicture({saveToPhotoAlbum: true, quality: 50, allowEdit: true, correctOrientation: true, targetWidth: 750, targetHeight: 750, destinationType: 0}).then(function(base64) {
    //   $scope.inspection.report.before_photo = "data:image/jpeg;base64," + base64
    // }).catch(function(res) {
    //   navigator.notification.alert(JSON.stringify(res), null)
    //   $scope.$emit(clovi.env.error, res)
    // })
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.inspection.before_photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(res) {
        $scope.$emit(denguechat.error, res)
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }


  $scope.changeTimeline = function(pageIndex) {
    $scope.state.pageIndex = pageIndex
  }

  $scope.transitionToPageIndex = function(pageIndex) {
    $scope.state.pageIndex = pageIndex
    $ionicSlideBoxDelegate.slide(pageIndex);
  }
}] )
