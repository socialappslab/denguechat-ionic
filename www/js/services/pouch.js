
angular.module('starter.services')
.factory('Pouch', ['$http', '$q', function($http, $q) {
  PouchDB.replicate('posts', 'http://localhost:5984/posts', {live: true});
  PouchDB.replicate('visits', 'http://localhost:5984/visits', {live: true});
  PouchDB.replicate('locations', 'http://localhost:5984/locations', {live: true});
  PouchDB.replicate('inspections', 'http://localhost:5984/inspections', {live: true});

  return {
    // See https://pouchdb.com/guides/compact-and-destroy.html
    // to understand why we use auto compaction.
    // HINT: We don't use revisions at all.
    postsDB: new PouchDB("posts", {auto_compaction: true}),
    visitsDB: new PouchDB("visits", {auto_compaction: true}),
    locationsDB: new PouchDB("locations", {auto_compaction: true}),
    inspectionsDB: new PouchDB("inspections", {auto_compaction: true}),
    syncDB: new PouchDB("sync"),


    createPostNeighborhoodView: function() {
      // document that tells PouchDB/CouchDB
      // to build up an index on doc.name
      var ddoc = {
        _id: '_design/posts',
        synced: true,
        views: {
          by_neighborhood_id: {
            map: function (doc) { emit(doc.neighborhood_id); }.toString()
          }
        }
      }
      this.postsDB.put(ddoc).then(function () {
        // success!
      }).catch(function (err) {
        // some error (maybe a 409, because it already exists?)
      });
    },

    createLocationNeighborhoodView: function() {
      // document that tells PouchDB/CouchDB
      // to build up an index on doc.name
      var ddoc = {
        _id: '_design/locations',
        synced: true,
        views: {
          by_neighborhood_id: {
            map: function (doc) { emit(doc.neighborhood_id); }.toString()
          }
        }
      }
      this.locationsDB.put(ddoc).then(function () {
        // success!
      }).catch(function (err) {
        // some error (maybe a 409, because it already exists?)
      });
    }

  };
}]);
