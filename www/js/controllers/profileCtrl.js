angular.module('starter.controllers')
.controller('profileCtrl', function($scope, User, $ionicLoading, $cordovaCamera) {
  $scope.user_data = {}
  $ionicLoading.show({hideOnStateChange: true})

  User.current().then(function(user) {
    console.log("Retrieved current User: "+JSON.stringify(user))
    user.data = JSON.parse(user.data)
    $scope.user = user.data.user;
    return User.save(user.data.user)
  }).catch(function(res) {
    $scope.$emit(denguechat.error, res)
  }).finally(function() {
    $ionicLoading.hide()
  })

  $scope.loadCamera = function() {
    $cordovaCamera.getPicture({saveToPhotoAlbum: false, quality: 50, allowEdit: true, correctOrientation: true, targetWidth: 500, targetHeight: 500, destinationType: 0}).then(function(base64) {
      $scope.$applyAsync(function() {
        $scope.user.picture = "data:image/jpeg;base64," + base64
      })
    }).catch(function(res) {
      navigator.notification.alert("Something went wrong!", null)
      $scope.$emit(denguechat.error, res)
    })
  }

  $scope.update = function() {
    $ionicLoading.show({hideOnStateChange: true})

    User.update($scope.user).catch(function(res) {
      $scope.$emit(denguechat.error, res)
    }).catch(function(res) {
      $scope.$emit(denguechat.error, res)
    }).finally(function() {
      $ionicLoading.hide()
    })
  }
})
