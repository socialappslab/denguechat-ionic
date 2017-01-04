/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Inspection', function($http, User) {
  return {
    // TODO: Move to PouchDB
    create: function(inspection) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "inspections/",
        data: {
          inspection: inspection
        },
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    get: function(id) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "visits/" + id,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    }
  };
})
