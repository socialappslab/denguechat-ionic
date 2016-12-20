/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Message', function($http, Participant) {
  return {
    get: function(providerSlug) {
      if (providerSlug) {
        return $http({
          method: "GET",
          url:    clovi.env.baseURL + "messages?provider_id=" + providerSlug,
          headers: {
           "Clovi-API-V0-Device-Session-Token": Participant.getToken()
         }
        })
      } else {
        return $http({
          method: "GET",
          url:    clovi.env.baseURL + "conversations/",
          headers: {
           "Clovi-API-V0-Device-Session-Token": Participant.getToken()
         }
        })
      }
    },
    create: function(providerSlug, message) {
      return $http({
        method: "POST",
        url:    clovi.env.baseURL + "messages?provider_id=" + providerSlug,
        data: {body: message},
        headers: {
         "Clovi-API-V0-Device-Session-Token": Participant.getToken()
       }
      })
    },
    getWithOffset: function(providerSlug, offset) {
      return $http({
        method: "GET",
        url:    clovi.env.baseURL + "messages?provider_id=" + providerSlug + "&offset=" + offset,
        headers: {
         "Clovi-API-V0-Device-Session-Token": Participant.getToken()
       }
      })
    }
  };
})
