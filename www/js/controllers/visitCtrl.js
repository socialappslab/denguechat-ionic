angular.module('starter.controllers')
.controller('visitCtrl', ['$scope', '$state', 'Visit', "$ionicModal", "$ionicLoading", "Inspection", "User", function($scope, $state, Visit, $ionicModal, $ionicLoading, Inspection, User) {
  $scope.visit       = {};
  $scope.inspection  = {report: {}};

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({hideOnStateChange: true})

    User.get().then(function(user) {
      $scope.breeding_sites = user.breeding_sites
    });

    Visit.get($state.params.visit_id).then(function(response) {
      $scope.visit               = response
      $scope.inspection.visit_id = $scope.visit.id

      if (!$scope.visit.inspections || $scope.visit.inspections.length == 0) {
        $scope.visit.inspections = []
        $ionicLoading.hide()
      } else {
        Inspection.getAll($scope.visit.inspections).then(function(inspections) {
          $ionicLoading.hide()
          $scope.visit.inspections = inspections
        })
      }
    })
  })

  $scope.refresh = function() {
    Visit.get($state.params.location_id, $state.params.visit_date, $state.params.visit_id).then(function(response) {
      $scope.visit = response.visit
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
      $scope.state.firstLoad = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
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

  $scope.create = function() {
    $ionicLoading.show({hideOnStateChange: true})

    $scope.inspection.created_at = (new Date()).toISOString()
    $scope.inspection.color      = Inspection.color($scope.inspection)
    $scope.inspection.position   = $scope.visit.inspections.length + 1

    doc_id = Inspection.documentID($state.params.id, $state.params.visit_id, $scope.inspection)
    Inspection.save(doc_id, $scope.inspection, {remote: true}).then(function(response) {
      if ($scope.visit.inspections)
        $scope.visit.inspections.push(doc_id)
      else
        $scope.visit.inspections = [doc_id]
      Visit.save($state.params.visit_id, $scope.visit, {remote: false, synced: true}).then(function(res) {
        $ionicLoading.hide().then(function() {
          $scope.closeNewInspectionModal()
        })
      })
    })
  }

  // $scope.$on(denguechat.env.data.refresh, function() {
  //   $scope.state.firstLoad = true;
  //   $scope.refresh();
  // })

  // $scope.$on("$ionicView.loaded", function() {
  //   $scope.refresh();
  // })
}] )
