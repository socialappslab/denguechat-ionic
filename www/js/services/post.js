/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Post', function($http, User) {
  return {
    get: function(n_id, limit, offset) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "/posts?neighborhood_id=" + n_id + "&limit=" + limit + "&offset=" + offset,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    create: function(post) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "/posts",
        data: {
          post: post
        },
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    }
  };
})
