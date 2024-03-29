/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
  .factory('Location', function (User, Pouch, $q, Backoff, Visit, cordovaHTTP) {
    var backoff = new Backoff({ min: 1000, max: 60000 });
    var whitelistedKeys = ["id", "user_id", "latitude", "longitude", "neighborhood_id", "address", "last_visited_at", "visits", "questions"];

    // Helper function.
    var cleanAddress = function (address) {
      return address.toLowerCase();
    }

    // Pouch.locationsDB.destroy()
    return {
      timeout: null,
      syncStatus: { backoff: backoff, error: {} },

      documentID: function (user, location) {
        return user.id + location.neighborhood_id + location.address
      },

      getAll: function () {
        thisLocation = this
        return User.get().then(function (user) {
          console.log("\n\n\n")
          console.log(JSON.stringify(user))
          console.log("\n\n\n")
          return Pouch.locationsDB.find({
            selector: {
              user_id: user.id
              // $and: [
              //   { user_id: user.id },
              //   { neighborhood_id: user.neighborhood.id }
              // ]
            }
          }).then(function (res) {
            return res.docs
          }, function (err) {
            console.log("Something is wrong...")
            console.log(JSON.stringify(err))
          })
        })
      },
      findAllByNeighborhoodId: function (neighborhood_id) {
        return Pouch.locationsDB.query("locations/by_neighborhood_id", {
          key: neighborhood_id,
          include_docs: true
        })
      },

      search: function (address) {
        return Pouch.locationsDB.find({
          selector: { address: address }
        })
      },
      // TODO: Convert to PouchDB.
      create: function (location) {
        return User.get().then(function (user) {
          return cordovaHTTP.post(denguechat.env.baseURL + 'locations/', { location: location }, {
            'Authorization': 'Bearer ' + user.token
          });
        });
      },

      getAllFromCloud: function () {
        thisLocation = this
        return User.get().then(function (user) {
          return cordovaHTTP.get(denguechat.env.baseURL + 'locations/mobile', {}, {
            'Authorization': 'Bearer ' + user.token
          }).then(function (res) {
            res.data = JSON.parse(res.data)
            return thisLocation.saveMultiple(user, res.data.locations || [], [], null)
          });
        });

      },
      getFromCloud: function (doc) {
        thisLocation = this
        return User.get().then(function (user) {
          return cordovaHTTP.get(denguechat.env.baseURL + 'locations/' + cleanAddress(doc.address), {}, {
            'Authorization': 'Bearer ' + user.token
          }).then(function (res) {
            res.data = JSON.parse(res.data)
            doc_id = thisLocation.documentID(user, res.data.location);
            return thisLocation.save(doc_id, res.data.location, { remote: false, synced: true });
          });
        });
      },

      syncUnsyncedDocuments: function () {
        if (this.timeout) {
          backoff.reset()
          clearTimeout(this.timeout)
        }

        thisLocation = this
        Pouch.locationsDB.changes({
          include_docs: false,
          conflicts: false,
          filter: function (doc) {
            return !doc.synced
          }
        }).then(function (changes) {
          if (changes.results.length > 0) {
            console.log("Changes still to be synced:")
            console.log(JSON.stringify(changes))
            console.log("------")
            thisLocation.syncMultiple(changes.results)
          }
        })
      },

      saveMultiple: function (user, locations, document_ids, deferred) {
        thisLocation = this
        if (!deferred)
          deferred = $q.defer();

        if (locations.length == 0) {
          deferred.resolve(document_ids)
          return deferred.promise
        } else {
          loc = locations.shift();
          loc.user_id = user.id
          loc_doc_id = thisLocation.documentID(user, loc)
          thisLocation.save(loc_doc_id, loc, { remote: false, synced: true }).then(function (doc) {
            document_ids.push(loc_doc_id)

            Visit.saveMultiple(loc_doc_id, loc.visits, [], null).then(function (visit_doc_ids) {
              loc.visits = visit_doc_ids
              thisLocation.save(loc_doc_id, loc, { remote: false, synced: true }).then(function (res) {
                thisLocation.saveMultiple(user, locations, document_ids, deferred)
              })
            })
          })

          return deferred.promise;
        }
      },

      syncMultiple: function (documents) {
        thisLocation = this

        duration = backoff.duration()
        console.log("Running syncMultiple with documents:")
        console.log(documents)
        console.log("-----")

        doc = documents.shift()
        if (doc) {
          setTimeout(function () {
            thisLocation.sendChangesToCloud(doc.id).then(function (doc) {
              backoff.reset()
              thisLocation.syncMultiple(documents)
            })
          }, duration)
        }
      },


      get: function (document_id) {
        return Pouch.locationsDB.get(document_id)
      },

      // May actually be reusable for non-blob syncing stuff...
      save: function (doc_id, location, options) {
        thisLocation = this
        if (options.remote == true)
          backoff.reset()

        // There should be at most one location for participant hence reusing this docID.
        //  TODO: Maybe this is where we run the 'util' function comparing last document ot current
        // and only storing the "diff"... Our custom diff function of sorts. See:
        // https://github.com/pouchdb/upsert#example-2
        return Pouch.locationsDB.upsert(doc_id, function (doc) {
          // NOTE: We only update if the new key exists AND it doesn't
          // equal what's stored in DB. This allows us to sync data bidirectionally
          // without overwriting with trivial values.
          changed = false

          // TODO: Remove the whitelisting...
          for (var key in _.pick(location, whitelistedKeys)) {
            if (doc[key] != location[key]) {
              changed = true
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

      unsyncedChanges: function () {
        return Pouch.locationsDB.changes({
          include_docs: true,
          conflicts: false,
          filter: function (doc) { return !doc.synced }
        }).then(function (changes) {
          return changes.results
        })
      },


      sendToCloud: function (changes) {
        return User.get().then(function (user) {
          return cordovaHTTP.put(denguechat.env.baseURL + 'sync/location', { changes: changes }, {
            'Authorization': 'Bearer ' + user.token
          });
        });
      },

      sync: function (document_id) {
        thisLocation = this

        duration = backoff.duration()
        console.log("Current backoff duration is: ")
        console.log(duration)
        console.log("-----")

        this.timeout = setTimeout(function () {
          thisLocation.sendChangesToCloud(document_id)
        }, duration);
      },

      sendChangesToCloud: function (document_id) {
        thisLocation = this;
        return Pouch.locationsDB.get(document_id).then(function (location) {
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
            filter: function (doc) {
              return !doc.synced
            }
          }).then(function (changes) {
            if (changes.results.length > 0) {
              console.log("Changes to be sent to the cloud:")
              console.log(JSON.stringify(changes))
              console.log("-----")

              return thisLocation.sendToCloud(changes).then(function (res) {
                console.log("Successful response from cloud...")
                console.log(JSON.stringify(res))
                console.log("------")

                // Reset backoff.
                backoff.reset();
                res.data = JSON.parse(res.data)
                // Update the location model.
                for (var key in res.data.location) {
                  location[key] = res.data.location[key]
                }
                location.synced = true
                location.last_synced_at = res.data.last_synced_at
                return Pouch.locationsDB.put(location)
              }, function (res) {
                console.log("Failed with error:");
                console.log(JSON.stringify(res))
                thisLocation.syncStatus.error = res;
                console.log("------")
                thisLocation.sync(location._id)
              });
            }
          });
        })
      }
    };
  })
