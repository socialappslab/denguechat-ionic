/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('LocationQuiz', function($http, User) {
  return {
    questions: function() {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "locations/questions",
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    shouldDisplay: function(code) {
      
    }
  };
})
