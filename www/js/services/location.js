/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Location', function($http, User) {
  return {
    neighborhoods: [
      {"id":3,"name":"Tepalcingo"},
      {"id":4,"name":"Ocachicualli"},
      {"id":1,"name":"Maré"},
      {"id":8,"name":"La Quinta"},
      {"id":5,"name":"Francisco Meza"},
      {"id":7,"name":"Ariel Darce"},
      {"id":9,"name":"Josefa Ortiz de Domínguez"},
      {"id":10,"name":"Galope"},
      {"id":11,"name":"Tangará"},
      {"id":12,"name":"Centro Escolar Rafaela Herrera"}
    ],
    search: function(query) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "locations/search?address=" + query,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    create: function(location) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "locations/",
        data: {
          location: location
        },
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    update: function(location) {
      return $http({
        method: "PUT",
        url:    denguechat.env.baseURL + "locations/" + location.id,
        data: {
          location: location
        },
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    get: function(id) {
      if (id) {
        return $http({
          method: "GET",
          url:    denguechat.env.baseURL + "locations/" + id,
          headers: {
           "Authorization": "Bearer " + User.getToken()
         }
        })
      } else {
        return $http({
          method: "GET",
          url:    denguechat.env.baseURL + "locations/mobile",
          headers: {
           "Authorization": "Bearer " + User.getToken()
         }
        })
      }
    }
  };
})
