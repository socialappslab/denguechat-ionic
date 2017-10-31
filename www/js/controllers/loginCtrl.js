angular.module('starter.controllers')
.controller('loginCtrl', function($scope, User) {
  $scope.state = {loading: false, error: null}
  $scope.user  = {}
  $scope.view  = "login"

  $scope.toggleTo = function(name) {
    $scope.state.error = null
    $scope.view        = name
  }

  $scope.login = function(){
    $scope.state = {loading: true, error: null}
/*
    User.session($scope.user.username, $scope.user.password).then(function(response) {
      return User.save(response.data.user).then(function(doc) {
        $scope.$emit(denguechat.env.auth.success, {})
      })
    }).catch(function(res) {
      $scope.$emit(denguechat.error, res)
    }).finally(function() {
      $scope.state.loading = false;
    })*/

    cordova.plugin.http.acceptAllCerts(true, function() {
      console.log('SSL pinning success!');
      console.log("request to: " + denguechat.env.baseURL + "sessions");
      console.log("with params: " + $scope.user.username + "/" + $scope.user.password)
  
    cordova.plugin.http.post(denguechat.env.baseURL + "sessions", {
      username: $scope.user.username,
      password: $scope.user.password
    }, { Authorization: "OAuth2: token" }, function(response) {
      // prints 200
      console.log(response.status);
      $scope.$emit(denguechat.env.auth.success, {})
    }, function(response) {
      // prints 403
      console.log(response.status);
  
      //prints Permission denied
      console.log(response.error);
      console.log("Error: " + JSON.stringify(response));
    });

  }, function() {
    console.log('error :(');
});


  }

  $scope.signup = function(){
    if ($scope.user.password != $scope.user.password_confirmation) {
      $scope.state.error = "Passwords do not match"
      return
    }

    $scope.state.loading = true
    $scope.state.error   = true

    User.create($scope.user.username, $scope.user.password).then(function(response) {
      $scope.login()
    }, function(error) {
      if (error.data.errors.username)
        $scope.state.error = "Username " + error.data.errors.username[0]
      else if (error.data.errors.password)
          $scope.state.error = "Password " + error.data.errors.password[0]
    }).finally(function() {
      $scope.state.loading = false;
    })
  }
})
