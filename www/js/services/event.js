/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Event', function($http, Participant) {
  return {
    get: function(slug) {
      if (slug) {
        return $http({
          method: "GET",
          url:    clovi.env.baseURL + "events/" + slug,
          headers: {
           "Clovi-API-V0-Device-Session-Token": Participant.getToken()
         }
        })
      } else {
        return $http({
          method: "GET",
          url:    clovi.env.baseURL + "events",
          headers: {
           "Clovi-API-V0-Device-Session-Token": Participant.getToken()
         }
        })
      }
    }
  };
})
