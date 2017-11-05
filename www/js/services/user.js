/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
  .factory('User', function ($window, Pouch, $q, cordovaHTTP) {

    return {
      get: function () {
        return $q.when(Pouch.usersDB.get("user"))
      },

      save: function (user) {
        return Pouch.usersDB.upsert("user", function (doc) {
          for (var key in user) {
            doc[key] = user[key]
          }

          return doc
        })
      },

      destroy: function () {
        console.log(Pouch.usersDB.adapter);

        return this.get().then(function (doc) {
          return Pouch.usersDB.remove(doc)
        })
      },
      // TODO: This is an authentication token and it's stored in plain sight!!!!
      // Improve on the security by storing in Apple's Vault or Android's Vault...
      setToken: function (token) {
        if (token == null)
          $window.localStorage.setItem("token", "");
        else
          $window.localStorage.setItem("token", token);
      },

      getToken: function () {
        return this.get().then(function (doc) {
          return doc.token;
        })
      },

      create: function (username, password) {
        return cordovaHTTP.post(denguechat.env.baseURL + 'registrations', {
          username: username,
          password: password
        }, { 'content-type': 'application/json'});
      },

      update: function (user) {
        return this.getToken().then(function (token) {
          return cordovaHTTP.put(denguechat.env.baseURL + 'users/' + user.id, {
            user: user
          }, { 'Authorization': 'Bearer ' + token });
        });
      },

      session: function (username, password) {
        return cordovaHTTP.post(denguechat.env.baseURL + "sessions", {
          username: username,
          password: password
        }, {});
      },

      current: function () {
        return this.getToken().then(function (token) {
          console.log("getToken: "+token)
          return cordovaHTTP.get(denguechat.env.baseURL + 'sessions/current', {},
            { 'Authorization': 'Bearer ' + token }
          );
        });
      },
    };
  })
