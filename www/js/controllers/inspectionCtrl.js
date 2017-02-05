angular.module('starter.controllers')
.controller('inspectionCtrl', ['$scope', '$state', 'Visit', "$ionicModal", "$ionicLoading", "Inspection", "User", "$ionicHistory", function($scope, $state, Visit, $ionicModal, $ionicLoading, Inspection, User, $ionicHistory) {
  $scope.visit       = {};
  $scope.inspection  = {report: {}};
  $scope.inspections = []

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({hideOnStateChange: true})

    User.get().then(function(user) {
      $scope.breeding_sites = user.breeding_sites

      Inspection.get($state.params.inspection_id).then(function(response) {
        $scope.inspection = response

        if ($scope.inspection.report.breeding_site) {
          for (var i=0; i < $scope.breeding_sites.length; i++) {
            if ($scope.breeding_sites[i].id == $scope.inspection.report.breeding_site.id)
              $scope.inspection.report.breeding_site = $scope.breeding_sites[i]
          }
        }

        if ($scope.inspection.report.elimination_method) {
          for (var i=0; i < $scope.inspection.report.breeding_site.elimination_methods.length; i++) {
            if ($scope.inspection.report.breeding_site.elimination_methods[i].id == $scope.inspection.report.elimination_method.id)
              $scope.inspection.report.elimination_method = $scope.inspection.report.breeding_site.elimination_methods[i]
          }
        }

        if ($scope.inspection.report.eliminated_at) {
          $scope.inspection.report.eliminated_at = new Date($scope.inspection.report.eliminated_at)
        }

        $ionicLoading.hide()
      })
    });
  })

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

  $scope.saveInspection = function() {
    $ionicLoading.show({hideOnStateChange: true})

    $scope.inspection.color = Inspection.color($scope.inspection)
    Inspection.save($state.params.inspection_id, $scope.inspection, {remote: true, synced: false}).then(function(response) {
      $ionicLoading.hide()
      $ionicHistory.goBack(-1)
    })
  }

  $scope.loadCamera = function() {
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.inspection.report.before_photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(response) {
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }

  $scope.loadAfterCamera = function() {
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.inspection.report.after_photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(response) {
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }

}] )
