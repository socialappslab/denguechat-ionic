/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('User', function($window, $http, Pouch, $q) {
  return {
    // set: function(user) {
    //   if (user)
    //     $window.localStorage.setItem("user", JSON.stringify(user));
    //   else
    //     $window.localStorage.setItem("user", "");
    // },
    // get: function() {
    //   user = $window.localStorage.getItem("user")
    //   if (user)
    //     return JSON.parse(user)
    //   else
    //     return {}
    // },
    get: function() {
      return $q.when(Pouch.usersDB.get("user"))
    },
    save: function(user) {
      return Pouch.usersDB.upsert("user", function(doc){
        for (var key in user) {
          doc[key] = user[key]
        }

        return doc
      })
    },
    destroy: function() {
      return this.get().then(function(doc) {
        return Pouch.usersDB.remove(doc)
      })
    },
    // TODO: This is an authentication token and it's stored in plain sight!!!!
    // Improve on the security by storing in Apple's Vault or Android's Vault...
    setToken: function(token) {
      if (token == null)
        $window.localStorage.setItem("token", "");
      else
        $window.localStorage.setItem("token", token);
    },
    getToken: function() {
      return this.get().then(function(doc) {
        return doc.token;
      })
      // return $window.localStorage.getItem("token") || "";
    },
    create: function(username, password) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "registrations",
        data:   {
          user: {
            username: username,
            password: password
          }
        }
      })
    },
    session: function(username, password) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "sessions",
        data:   {
          username: username,
          password: password
        }
      })
    },
    current: function() {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "sessions/current",
        headers: {
         "Authorization": "Bearer " + this.getToken()
        }
      })
    },
  };
})
