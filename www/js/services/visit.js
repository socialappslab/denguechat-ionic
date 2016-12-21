/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Visit', function($http, User) {
  return {
    get: function(id) {
      if (id) {
        return $http({
          method: "GET",
          url:    denguechat.env.baseURL + "visits/" + id,
          headers: {
           "Authorization": "Bearer " + User.getToken()
         }
        })
      } else {
        return $http({
          method: "GET",
          url:    denguechat.env.baseURL + "visits",
          headers: {
           "Authorization": "Bearer " + User.getToken()
         }
        })
      }
    }
  };
})
