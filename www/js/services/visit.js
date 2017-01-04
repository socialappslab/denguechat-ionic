/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Visit', function($http, User, Pouch) {
  var cleanAddress = function(address) {
    return address.toLowerCase();
  }

  var docID = function(visit) {
    return "neighborhoods/" + User.get().neighborhood.id + "/locations/" + visit.location_id + "visits/" + visit.visited_at
  }

  return {
    // TODO
    search: function(query) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "visits/search?date=" + query,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    // TODO: Convert to PouchDB.
    create: function(visit) {
      return $http({
        method: "POST",
        url:    denguechat.env.baseURL + "visits/",
        data: {
          visit: visit
        },
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    get: function(location_id, visit_date, visit_id) {
      url = denguechat.env.baseURL + "visits/" + visit_id
      return Pouch.cachedDoc(docID({visited_at: visit_date, location_id: location_id}), url);
    },
    // TODO
    getAll: function() {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "visits",
        headers: {
         "Authorization": "Bearer " + User.getToken()
        }
      })
    }
  };
})
