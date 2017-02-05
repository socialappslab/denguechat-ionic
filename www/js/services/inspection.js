/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Inspection', function($http, User, Pouch, $q, Backoff) {
  var backoff = new Backoff({ min: 1000, max: 60000 });
  var whitelistedKeys = ["id", "visit_id", "position", "location", "protected", "chemically_treated", "larvae", "pupae", "larvae", "report", "before_photo", "color", "created_at"];

  // Pouch.inspectionsDB.destroy()
  return {
    timeout: null,
    syncStatus: {backoff: backoff, error: {}},

    documentID: function(location_doc_id, visit_doc_id, ins) {
      return location_doc_id + visit_doc_id + ins.created_at + ins.position
    },

    color: function(inspection) {
      if(inspection.larvae || inspection.pupae) {
        return "#e74c3c";
      } else if (inspection.protected) {
        return "#2ecc71"
      } else {
        return "#f1c40f"
      }
    },

    getAll: function(ins_doc_ids) {
      return Pouch.inspectionsDB.allDocs({keys: ins_doc_ids, include_docs: true}).then(function(docs) {
        return docs.rows.map(function(el) { return el.doc })
      })
    },

    unsyncedChanges: function() {
      return Pouch.inspectionsDB.changes({
        include_docs: true,
        conflicts: false,
        filter: function(doc) { return !doc.synced }
      }).then(function(changes) {
        return changes.results
      })
    },


    syncUnsyncedDocuments: function() {
      thisInspection = this
      Pouch.inspectionsDB.changes({
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
          thisInspection.syncMultiple(changes.results)
        }
      })
    },

    saveMultiple: function(location_doc_id, visit_doc_id, inspections, ins_document_ids, insDeferred) {
      thisInspection = this
      if (!insDeferred)
        insDeferred = $q.defer();

      if (inspections.length == 0) {
        insDeferred.resolve(ins_document_ids);
        return insDeferred.promise;
      } else {
        ins    = inspections.shift();
        doc_id = thisInspection.documentID(location_doc_id, visit_doc_id, ins)
        thisInspection.save(doc_id, ins, {remote: false, synced: true}).then(function(doc) {
          ins_document_ids.push(doc_id)
          thisInspection.saveMultiple(location_doc_id, visit_doc_id, inspections, ins_document_ids, insDeferred)
        })

        return insDeferred.promise;
      }
    },

    syncMultiple: function(documents) {
      thisInspection = this

      duration = backoff.duration()
      console.log("Running syncMultiple with documents:")
      console.log(documents)
      console.log("-----")

      doc = documents.shift()
      if (doc) {
        setTimeout(function(){
          thisInspection.sendChangesToCloud(doc.id).then(function(doc) {
            backoff.reset()
            thisInspection.syncMultiple(documents)
          })
        }, duration)
      }
    },


    // May actually be reusable for non-blob syncing stuff...
    save: function(doc_id, visit, options) {
      thisInspection = this
      if (options.remote == true)
        backoff.reset()

      // There should be at most one visit for participant hence reusing this docID.
      //  TODO: Maybe this is where we run the 'util' function comparing last document ot current
      // and only storing the "diff"... Our custom diff function of sorts. See:
      // https://github.com/pouchdb/upsert#example-2
      return Pouch.inspectionsDB.upsert(doc_id, function(doc){
        // NOTE: We only update if the new key exists AND it doesn't
        // equal what's stored in DB. This allows us to sync data bidirectionally
        // without overwriting with trivial values.
        changed = false
        for (var key in _.pick(visit, whitelistedKeys)) {
          if (doc[key] != visit[key]) {
            changed  = true
            doc[key] = visit[key]
          }
        }

        // This will start the syncing process to communicate with Rails server.
        // It takes care of retrying (exponentially backing off) until a successful
        // response is received from server. At that point, the backoff timer resets.
        if (changed) {
          doc.synced = !!options.synced
          if (options.remote == true)
            thisInspection.sync(doc_id)
          return doc;
        }

        return false;
      })
    },


    sendToCloud: function(changes) {
      return User.get().then(function(user) {
        return $http({
          method: "PUT",
          url: denguechat.env.baseURL + "sync/inspection",
          data: {
            changes: changes
          },
          headers: {
            "Authorization": "Bearer " + user.token
          }
        })
      })
    },


    sync: function(document_id) {
      thisInspection = this

      duration = backoff.duration()
      console.log("Current backoff duration is: ")
      console.log(duration)
      console.log("-----")

      this.timeout = setTimeout(function(){
        thisInspection.sendChangesToCloud(document_id)
      }, duration);
    },

    sendChangesToCloud: function(document_id) {
      thisInspection = this;
      return Pouch.inspectionsDB.get(document_id).then(function(ins) {
        console.log("Sync starting for document:")
        console.log(ins)

        // TODO: REmove last sync sec
        return Pouch.inspectionsDB.changes({
          include_docs: true,
          conflicts: false,
          doc_ids: [ins._id],
          filter: function(doc) {
            return !doc.synced
          }
        }).then(function(changes) {
          if (changes.results.length > 0) {
            console.log("Changes to be sent to the cloud:")
            console.log(changes)
            console.log("-----")

            return thisInspection.sendToCloud(changes).then(function(res) {
              console.log("Successful response form cloud...")
              console.log(res)
              console.log("------")

              // Reset backoff.
              backoff.reset();

              // Update the ins model.
              ins.synced         = true
              ins.last_synced_at = res.last_synced_at
              return Pouch.inspectionsDB.put(ins)
            }, function(res) {
              console.log("Failed with error:");
              console.log(res)
              thisInspection.syncStatus.error = res;
              console.log("------")
              thisInspection.sync(ins._id)
            })
          }
        })



      })

    }





    // TODO: Move to PouchDB
    // create: function(inspection) {
    //   return $http({
    //     method: "POST",
    //     url:    denguechat.env.baseURL + "inspections/",
    //     data: {
    //       inspection: inspection
    //     },
    //     headers: {
    //      "Authorization": "Bearer " + User.getToken()
    //    }
    //   })
    // },
    // get: function(id) {
    //   return $http({
    //     method: "GET",
    //     url:    denguechat.env.baseURL + "visits/" + id,
    //     headers: {
    //      "Authorization": "Bearer " + User.getToken()
    //    }
    //   })
    // }
  };
})
