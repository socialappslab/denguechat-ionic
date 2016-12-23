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
    shouldDisplay: function(question, questions) {
      if (question.code == "informed_consent")
        return true

      for (var i=0; i < questions.length; i++) {
        if (questions[i].code == "informed_consent" && questions[i].answer == 1)
          return false
      }

      if (!question.parent)
        return true

      for (var i=0; i < questions.length; i++) {
        if (questions[i].code == question.parent.code)
          parentQ = questions[i]
      }

      return question.parent.display.indexOf(parentQ.answer) != -1
    }
  };
})
