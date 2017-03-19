angular.module('starter.controllers')
.controller('inspectionCtrl', ['$scope', '$state', 'Visit', "$ionicModal", "$ionicLoading", "Inspection", "User", "$ionicHistory", "$cordovaCamera", function($scope, $state, Visit, $ionicModal, $ionicLoading, Inspection, User, $ionicHistory, $cordovaCamera) {
  $scope.visit       = {};
  $scope.inspection  = {report: {}};
  $scope.inspections = []

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({hideOnStateChange: true})

    User.get().then(function(user) {
      $scope.breeding_sites = user.breeding_sites

      Visit.get($state.params.visit_id).then(function(visit) {
        $scope.visit = visit

        Inspection.get($state.params.inspection_id).then(function(response) {
          $scope.inspection       = response
          $scope.inspection.visit = {id: visit.id, pouchdb_id: visit._id}

          if ($scope.inspection.report.breeding_site) {
            $scope.inspection.report.breeding_site = _.find($scope.breeding_sites, function(bs) { return bs.id == $scope.inspection.report.breeding_site.id})
          }

          if ($scope.inspection.report.elimination_method) {
            $scope.inspection.report.elimination_method = _.find($scope.inspection.report.breeding_site.elimination_methods, function(em) { return em.id == $scope.inspection.report.elimination_method.id})
          }

          if ($scope.inspection.report.eliminated_at) {
            $scope.inspection.report.eliminated_at = new Date($scope.inspection.report.eliminated_at)
          }

          $ionicLoading.hide()
        })


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
    $cordovaCamera.getPicture({saveToPhotoAlbum: true, quality: 50, allowEdit: true, correctOrientation: true, targetWidth: 750, targetHeight: 750, destinationType: 0}).then(function(base64) {
      $scope.inspection.report.before_photo = "data:image/jpeg;base64," + base64
    }).catch(function(res) {
      navigator.notification.alert(JSON.stringify(res), null)
      $scope.$emit(clovi.env.error, res)
    })
  }

  $scope.loadAfterCamera = function() {
    $cordovaCamera.getPicture({saveToPhotoAlbum: true, quality: 50, allowEdit: true, correctOrientation: true, targetWidth: 750, targetHeight: 750, destinationType: 0}).then(function(base64) {
      $scope.inspection.report.after_photo = "data:image/jpeg;base64," + base64
    }).catch(function(res) {
      navigator.notification.alert(JSON.stringify(res), null)
      $scope.$emit(clovi.env.error, res)
    })
  }

}] )
