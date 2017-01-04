/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Location', function($http, User, Pouch) {
  // The root of the document ID naming.
  var locationDocumentURL = "neighborhoods/" + User.get().neighborhood.id + "/locations/";

  // Helper function.
  var cleanAddress = function(address) {
    return address.toLowerCase();
  }

  return {
    // TODO
    search: function(query) {
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "locations/search?address=" + query,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      })
    },
    // TODO: Convert to PouchDB.
    create: function(location) {
      // doc_id = locationDocumentURL + cleanAddress(location.address)
      // return Pouch.upsertDoc(doc_id, {location: location});
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
      return Pouch.upsertDoc(locationDocumentURL + cleanAddress(location.address), {location: location});
    },
    updateQuestions: function(location) {
      doc_id = locationDocumentURL + cleanAddress(location.address) + "/questions"
      return Pouch.upsertDoc(doc_id, {questions: location.questions});
    },
    getByAddress: function(address) {
      url = denguechat.env.baseURL + "locations/" + cleanAddress(address)
      return Pouch.cachedDoc(locationDocumentURL + cleanAddress(address), url);
    },
    getAll: function() {
      // TODO: Change this to use a different docId.
      docId = denguechat.env.baseURL + "locations/mobile"
      url   = docId
      return Pouch.cachedDoc(docId, url);
    }
  };
})
