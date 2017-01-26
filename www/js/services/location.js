/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Location', function($http, User, Pouch, $q, Backoff) {
  var backoff = new Backoff({ min: 1000, max: 60000 });
  var whitelistedKeys = ["id", "user_id", "latitude", "longitude", "neighborhood_id", "address", "last_visited_at", "visits_count"];


  // Helper function.
  var cleanAddress = function(address) {
    return address.toLowerCase();
  }

  // Pouch.locationsDB.destroy()

  return {
    documentID: function(location) {
      return location.neighborhood_id + location.address
    },

    getAll: function() {
      nid = User.get().neighborhood.id
      return this.findAllByNeighborhoodId(nid).then(function(doc) {
        docs = doc.rows.map(function(el) { return el.doc })
        console.log(docs)
        return _.sortBy(docs, function(d){ return d.address; });
      })
    },
    findAllByNeighborhoodId: function(neighborhood_id) {
      return Pouch.locationsDB.query("locations/by_neighborhood_id", {
        key: neighborhood_id,
        include_docs: true
      })
    },



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
    getAllFromCloud: function() {
      thisLocation = this
      nid = User.get().neighborhood.id
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "locations/mobile",
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
     }).then(function(res) {
        return thisLocation.saveMultiple(res.data.locations, [], null)
      })
    },
    getFromCloud: function(doc) {
      thisLocation = this
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "locations/" + cleanAddress(doc.address),
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
     }).then(function(res) {
       doc_id = thisLocation.documentID(res.data.location)
       return thisLocation.save(doc_id, res.data.location, {remote: false, synced: true})
      })
    },

    syncUnsyncedDocuments: function() {
      thisLocation = this
      Pouch.locationsDB.changes({
        include_docs: false,
        conflicts: false,
        filter: function(doc) {
          return !doc.synced
        }
      }).then(function(changes) {
        if (changes.results.length > 0) {
          console.log("Changes still to be synced:")
          console.log(changes)
          console.log("------")
          thisLocation.syncMultiple(changes.results)
        }
      })
    },

    saveMultiple: function(locations, document_ids, deferred) {
      thisLocation = this
      if (!deferred)
        deferred = $q.defer();

      if (locations.length == 0) {
        return deferred.resolve(document_ids)
      } else {
        loc    = locations.shift();
        doc_id = thisLocation.documentID(loc)
        console.log(loc)
        console.log(doc_id)
        return thisLocation.save(doc_id, loc, {remote: false, synced: true}).then(function(doc) {
          document_ids.push(doc_id)
          return thisLocation.saveMultiple(locations, document_ids, deferred)
        })

        return deferred.promise;
      }
    },

    syncMultiple: function(documents) {
      thisLocation = this

      duration = backoff.duration()
      console.log("Running syncMultiple with documents:")
      console.log(documents)
      console.log("-----")

      doc = documents.shift()
      if (doc) {
        setTimeout(function(){
          thisLocation.sendChangesToCloud(doc.id).then(function(doc) {
            backoff.reset()
            thisLocation.syncMultiple(documents)
          })
        }, duration)
      }
    },


    get: function(document_id) {
      return Pouch.locationsDB.get(document_id)
    },

    // May actually be reusable for non-blob syncing stuff...
    save: function(doc_id, location, options) {
      thisLocation = this
      if (options.remote == true)
        backoff.reset()

      // There should be at most one location for participant hence reusing this docID.
      //  TODO: Maybe this is where we run the 'util' function comparing last document ot current
      // and only storing the "diff"... Our custom diff function of sorts. See:
      // https://github.com/pouchdb/upsert#example-2
      return Pouch.locationsDB.upsert(doc_id, function(doc){
        // NOTE: We only update if the new key exists AND it doesn't
        // equal what's stored in DB. This allows us to sync data bidirectionally
        // without overwriting with trivial values.
        changed = false
        for (var key in _.pick(location, whitelistedKeys)) {
          if (doc[key] != location[key]) {
            changed  = true
            doc[key] = location[key]
          }
        }

        // This will start the syncing process to communicate with Rails server.
        // It takes care of retrying (exponentially backing off) until a successful
        // response is received from server. At that point, the backoff timer resets.
        if (changed) {
          doc.synced = !!options.synced
          if (options.remote == true)
            thisLocation.sync(doc_id)
          return doc;
        }

        return false;
      })
    },



    sendToCloud: function(changes) {
      return $http({
        method: "PUT",
        url: denguechat.env.baseURL + "sync/location",
        data: {
          changes: changes
        },
        headers: {
          "Authorization": "Bearer " + User.getToken()
        }
      })
    },


    sync: function(document_id) {
      thisLocation = this

      duration = backoff.duration()
      console.log("Current backoff duration is: ")
      console.log(duration)
      console.log("-----")

      setTimeout(function(){
        thisLocation.sendChangesToCloud(document_id)
      }, duration);
    },

    sendChangesToCloud: function(document_id) {
      return Pouch.locationsDB.get(document_id).then(function(location) {
        console.log("Sync starting for document:")
        console.log(location)

        // TODO: REmove last sync sec
        return Pouch.locationsDB.changes({
          include_docs: true,
          conflicts: false,
          // TODO: If we turn this on, we won't ever be able to match those that
          // are syncMultiple.
          // since: sync.last_sync_seq,
          doc_ids: [location._id],
          filter: function(doc) {
            return !doc.synced
          }
        }).then(function(changes) {
          if (changes.results.length > 0) {
            console.log("Changes to be sent to the cloud:")
            console.log(changes)
            console.log("-----")

            return thisLocation.sendToCloud(changes).then(function(res) {
              console.log("Successful response form cloud...")
              console.log(res)
              console.log("------")

              // Reset backoff.
              backoff.reset();

              // Update the location model.
              location.synced         = true
              location.last_synced_at = res.last_synced_at
              return Pouch.locationsDB.put(location)
            }, function(res) {
              console.log("Failed with error:");
              console.log(res)
              console.log("------")
              thisLocation.sync(location._id)
            })
          }
        })



      })

    }


  };
})
