/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
  .factory('Visit', function ($http, User, Pouch, $q, Backoff, Inspection, cordovaHTTP) {
    var backoff = new Backoff({ min: 1000, max: 60000 });

    var cleanAddress = function (address) {
      return address.toLowerCase();
    }

    // Pouch.visitsDB.destroy()
    return {
      timeout: null,
      syncStatus: { backoff: backoff, error: {} },

      documentID: function (location_doc_id, visit) {
        return location_doc_id + visit.visited_at
      },

      get: function (document_id) {
        return Pouch.visitsDB.get(document_id)
      },

      getAll: function (ins_doc_ids) {
        return Pouch.visitsDB.allDocs({ keys: ins_doc_ids, include_docs: true }).then(function (doc) {
          return doc.rows.map(function (el) { return el.doc })
        })
      },

      addInspection: function (visit_doc_id, ins_doc_id) {
        thisVisit = this
        return thisVisit.get(visit_doc_id).then(function (doc) {
          doc.inspections.push(ins_doc_id)
          return thisVisit.save(visit_doc_id, doc, { remote: false, synced: true })
        })
      },

      unsyncedChanges: function () {
        return Pouch.visitsDB.changes({
          include_docs: true,
          conflicts: false,
          filter: function (doc) { return !doc.synced }
        }).then(function (changes) {
          return changes.results
        })
      },

      syncUnsyncedDocuments: function () {
        if (this.timeout) {
          backoff.reset()
          clearTimeout(this.timeout)
        }

        thisVisit = this
        Pouch.visitsDB.changes({
          include_docs: false,
          conflicts: false,
          filter: function (doc) {
            return !doc.synced
          }
        }).then(function (changes) {
          if (changes.results.length > 0) {
            console.log("Changes still to be synced:")
            console.log(JSON.stringify(changes));
            console.log("------")
            thisVisit.syncMultiple(changes.results)
          }
        })
      },

      saveMultiple: function (location_doc_id, visits, document_ids, deferred) {
        thisVisit = this
        if (!deferred)
          deferred = $q.defer();

        if (visits.length == 0) {
          deferred.resolve(document_ids)
          return deferred.promise
        } else {
          visit = visits.shift();
          visit_doc_id = thisVisit.documentID(location_doc_id, visit)

          thisVisit.save(visit_doc_id, visit, { remote: false, synced: true }).then(function (doc) {
            document_ids.push(visit_doc_id)

            Inspection.saveMultiple(location_doc_id, visit_doc_id, visit.inspections, [], null).then(function (ins_doc_ids) {
              console.log("Inspection doc IDS:")
              console.log(ins_doc_ids)
              console.log("------")
              visit.inspections = ins_doc_ids
              thisVisit.save(visit_doc_id, visit, { remote: false, synced: true }).then(function (res) {
                thisVisit.saveMultiple(location_doc_id, visits, document_ids, deferred)
              })
            })
          })

          return deferred.promise;
        }
      },

      syncMultiple: function (documents) {
        thisVisit = this

        duration = backoff.duration()
        console.log("Running syncMultiple with documents:")
        console.log(JSON.stringify(documents))
        console.log("-----")

        doc = documents.shift()
        if (doc) {
          setTimeout(function () {
            thisVisit.sendChangesToCloud(doc.id).then(function (doc) {
              backoff.reset()
              thisVisit.syncMultiple(documents)
            })
          }, duration)
        }
      },


      // May actually be reusable for non-blob syncing stuff...
      save: function (doc_id, visit, options) {
        thisVisit = this
        if (options.remote == true)
          backoff.reset()

        // There should be at most one visit for participant hence reusing this docID.
        //  TODO: Maybe this is where we run the 'util' function comparing last document ot current
        // and only storing the "diff"... Our custom diff function of sorts. See:
        // https://github.com/pouchdb/upsert#example-2
        return Pouch.visitsDB.upsert(doc_id, function (doc) {
          // NOTE: We only update if the new key exists AND it doesn't
          // equal what's stored in DB. This allows us to sync data bidirectionally
          // without overwriting with trivial values.
          changed = false
          for (var key in visit) {
            if (doc[key] != visit[key]) {
              changed = true
              doc[key] = visit[key]
            }
          }

          // This will start the syncing process to communicate with Rails server.
          // It takes care of retrying (exponentially backing off) until a successful
          // response is received from server. At that point, the backoff timer resets.
          if (changed) {
            doc.synced = !!options.synced
            if (options.remote == true)
              thisVisit.sync(doc_id)
            return doc;
          }

          return false;
        })
      },


      sendToCloud: function (changes) {
        return User.get().then(function (user) {
          return cordovaHTTP.put(denguechat.env.baseURL + 'sync/visit', {
            changes: changes
          }, { 'Authorization': 'Bearer ' + user.token });
        });
      },


      sync: function (document_id) {
        thisVisit = this

        duration = backoff.duration()
        console.log("Current backoff duration is: ")
        console.log(duration)
        console.log("-----")

        this.timeout = setTimeout(function () {
          thisVisit.sendChangesToCloud(document_id)
        }, duration);
      },

      sendChangesToCloud: function (document_id) {
        thisVisit = this
        return Pouch.visitsDB.get(document_id).then(function (visit) {
          console.log("Sync starting for document:")
          console.log(JSON.stringify(visit))

          // TODO: REmove last sync sec
          return Pouch.visitsDB.changes({
            include_docs: true,
            conflicts: false,
            doc_ids: [visit._id],
            filter: function (doc) {
              return !doc.synced
            }
          }).then(function (changes) {
            if (changes.results.length > 0) {
              console.log("Changes to be sent to the cloud:")
              console.log(JSON.stringify(changes))
              console.log("-----")

              return thisVisit.sendToCloud(changes).then(function (res) {
                console.log("Successful response from cloud...")
                console.log(JSON.stringify(res))
                console.log("------")

                // Reset backoff.
                backoff.reset();
                res.data = JSON.parse(res.data)
                // Update the visit model.
                for (var key in res.data.visit) {
                  visit[key] = res.data.visit[key]
                }
                visit.synced = true
                visit.last_synced_at = res.data.last_synced_at
                return Pouch.visitsDB.put(visit)
              }, function (res) {
                console.log("Failed with error:");
                console.log(res)
                thisVisit.syncStatus.error = res
                console.log("------")
                thisVisit.sync(visit._id)
              })
            }
          })



        })

      },


      getAllFromCloud: function () {
        thisVisit = this
        return User.get().then(function (user) {
          return cordovaHTTP.get(denguechat.env.baseURL + 'visits/mobile', {},
            { 'Authorization': 'Bearer ' + user.token }).then(function (res) {
              res.data = JSON.parse(res.data)
              return thisVisit.saveMultiple(res.data.visits, [], null)
            });
        });
      },

      // TODO
      search: function (query) {
        return User.getToken().then(function (token) {
          return cordovaHTTP.get(denguechat.env.baseURL + 'visits/search?date=' + query, {},
            { 'Authorization': 'Bearer ' + token });
        });
      }
    };
  })
