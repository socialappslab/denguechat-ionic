angular.module('starter.controllers')
.controller('visitCtrl', ['$scope', '$state', 'Visit', "$ionicModal", "$ionicLoading", "Inspection", function($scope, $state, Visit, $ionicModal, $ionicLoading, Inspection) {
  $scope.visit       = {};
  $scope.inspections = [];

  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({hideOnStateChange: true})

    Visit.get($state.params.visit_id).then(function(response) {
      $scope.visit = response

      Inspection.getAll($scope.visit.inspections).then(function(inspections) {
        $ionicLoading.hide()
        $scope.visit.inspections = inspections
      })
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

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.firstLoad = true;
    $scope.refresh();
  })

  // $scope.$on("$ionicView.loaded", function() {
  //   $scope.refresh();
  // })
}] )
