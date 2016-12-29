/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Post', function($http, User) {
  return {
    get: function(city_id, limit, offset) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "/posts?city_id=" + city_id + "&limit=" + limit + "&offset=" + offset,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    }
  };
})
