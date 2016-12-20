/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Measurement', function($http, Participant) {
  return {
    get: function(id) {
      if (id) {
        return $http({
          method: "GET",
          url:    clovi.env.baseURL + "measurements/" + id,
          headers: {
           "Clovi-API-V0-Device-Session-Token": Participant.getToken()
         }
        })
      } else {
        return $http({
          method: "GET",
          url:    clovi.env.baseURL + "measurements",
          headers: {
           "Clovi-API-V0-Device-Session-Token": Participant.getToken()
         }
        })
      }
    },
    getWithOffset: function(offset) {
      return $http({
        method: "GET",
        url:    clovi.env.baseURL + "measurements?offset=" + offset,
        headers: {
         "Clovi-API-V0-Device-Session-Token": Participant.getToken()
       }
      })
    }
  };
})
