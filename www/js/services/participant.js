/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Participant', function($window, $http) {
  return {
    set: function(patient) {
      this.setToken(patient.token);
      $window.localStorage.setItem("patient", JSON.stringify(patient || {}));
    },
    // TODO: This is an authentication token and it's stored in plain sight!!!!
    // Improve on the security by storing in Apple's Vault or Android's Vault...
    setToken: function(token) {
      if (token == null)
        $window.localStorage.removeItem("token");
      else
        $window.localStorage.setItem("token", token);
    },
    getToken: function() {
      return $window.localStorage.getItem("token");
    },
    create: function(email, password) {
      return $http({
        method: "POST",
        url:    clovi.env.baseURL + "registrations",
        data:   {
          participant: {
            email: email,
            password: password
          },
          device: {name: "iPhone", model: "7", systemName: "iOS"}
        }
      })
    },
    session: function(email, password) {
      return $http({
        method: "POST",
        url:    clovi.env.baseURL + "sessions",
        data:   {
          email: email,
          password: password,
          device: {name: "iPhone", model: "7", systemName: "iOS"}
        }
      })
    },
    logout: function() {
      par = this;

      return $http({
        method: "DELETE",
        url:    clovi.env.baseURL + "sessions",
        headers: {
         "Clovi-API-V0-Device-Session-Token": this.getToken()
        }
      }).then(function(response) {}, function(error) {
        $window.alert("Something went wrong!")
      }).finally(function(response) {
        par.setToken(null);
      })


    }
  };
})
