
angular.module('starter.services')
.factory('Pouch', ['$http', '$q', 'User', function($http, $q, User) {
  PouchDB.replicate('denguechat', 'http://localhost:5984/denguechat', {live: true});
  return {
    db: new PouchDB("denguechat"),

    // Make an AJAX call to the supplied URL.
    // Save a successful response to our local PouchDB, with the URL as key.
    fetchDoc: function(docID, url){
      var self = this;

      return $http({
        method: "GET",
        url: url,
        headers: {
          "Authorization": "Bearer " + User.getToken()
        }
      }).then(function(response) {
        console.log("Data returned...")
        doc = response.data;
        doc._id = docID;
        self.db.put(doc);
        return response.data;
      })
    },

    // Attempt to get a document from our local PouchDB.
    // If the document does not exist, fetch it from the Rails API.
    cachedDoc: function(docID, url){
      var self = this;

      return $q.when(
        self.db.get(docID).then(function(doc){
          console.log("Returning document...")
          console.log(doc)
          return doc;
        }).catch(function(err){
          console.log("Error caught!")
          console.log(err)
          if (err.status == 404) {
            console.log("FEtching doc...")
            return self.fetchDoc(docID, url);
          }
        })
      );
    },

    // Push changes in a doc to our local PouchDB.
    upsertDoc: function(docId, changes){
      var self = this;

      return $q.when(
        self.db.upsert(docId, function(doc){
          for (var key in changes) {
            doc[key] = changes[key];
          }
          doc.updated_at = new Date().toJSON();
          return doc;
        }).then(function(response){
          return response;
        }).catch(function(err){
          return err;
        })
      );
    }

  };
}]);
