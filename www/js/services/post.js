/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
  .factory('Post', function ($q, User, Pouch, Backoff, _, cordovaHTTP) {
    var backoff = new Backoff({ min: 1000, max: 60000 });
    var whitelistedKeys = ["id", "user_id", "neighborhood_id", "photo", "base64_photo", "content", "liked", "created_at", "user", "timestamp"];

    return {
      timeout: null,
      syncStatus: { backoff: backoff, error: {} },

      documentID: function (user, post) {
        return user.id + (new Date(post.created_at)).toISOString() + post.neighborhood_id
      },

      like: function (post) {
        post.liked = !post.liked
        return this.save(post._id, post, { remote: true })
      },

      get: function (document_id) {
        return Pouch.postsDB.get(document_id)
      },

      getAll: function () {
        thisPost = this
        return User.get().then(function (user) {
          nids = _.map(user.neighborhoods, function (n) { return n.id })

          return thisPost.findAllByNeighborhoodIds(nids).then(function (doc) {
            console.log(doc)
            return doc
          })
        })
      },
      findAllByNeighborhoodIds: function (nids) {
        // Pouch.postsDB.getIndexes().then(function(res) {
        //   _.map(res.indexes, function(ind) {
        //     if (ind.ddoc) {
        //       console.log(ind)
        //       return Pouch.postsDB.deleteIndex(ind)
        //     }
        //   })
        // })

        // NOTE: Until this issue is resolved, we'll be using
        // underscore to sort:
        // https://github.com/pouchdb/pouchdb/issues/6266
        // NOTE: This is problematic because it creates an index and is sent for
        // sync server.
        // return Pouch.postsDB.createIndex({
        //   index: { fields: ["neighborhood_id"] }
        // }).then(function() {
        //   return Pouch.postsDB.find({
        //     selector: {
        //       neighborhood_id: {$in: nids}
        //     }
        //     // sort: [{created_at: "asc"}]
        //   })
        // }).then(function(res) {
        //   return _.sortBy(res, function(r) {return r.created_at})
        // })
        return Pouch.postsDB.find({
          selector: {
            neighborhood_id: { $in: nids }
          }
          // sort: [{created_at: "asc"}]
        }).then(function (res) {
          return _.sortBy(res.docs, function (r) { return r.created_at }).reverse()
        })
      },


      // May actually be reusable for non-blob syncing stuff...
      save: function (doc_id, post, options) {
        thisPost = this
        if (options.remote == true)
          backoff.reset()

        // There should be at most one post for participant hence reusing this docID.
        //  TODO: Maybe this is where we run the 'util' function comparing last document ot current
        // and only storing the "diff"... Our custom diff function of sorts. See:
        // https://github.com/pouchdb/upsert#example-2
        return Pouch.postsDB.upsert(doc_id, function (doc) {
          // NOTE: We only update if the new key exists AND it doesn't
          // equal what's stored in DB. This allows us to sync data bidirectionally
          // without overwriting with trivial values.
          changed = false
          for (var key in _.pick(post, whitelistedKeys)) {
            if (doc[key] != post[key]) {
              changed = true
              doc[key] = post[key]
            }
          }

          // This will start the syncing process to communicate with Rails server.
          // It takes care of retrying (exponentially backing off) until a successful
          // response is received from server. At that point, the backoff timer resets.
          if (changed) {
            doc.synced = !!options.synced
            if (options.remote == true)
              thisPost.sync(doc_id)
            return doc;
          }

          return false;
        })
      },

      getFromCloud: function (limit, offset) {
        thisPost = this
        return User.get().then(function (user) {
          return cordovaHTTP.get(denguechat.env.baseURL + 'posts?mobile=1&city_id=' + user.neighborhood.city_id + '&limit=' + limit + '&offset=' + offset, {},
            {
              'Authorization': 'Bearer ' + user.token
            }).then(function (res) {
              return thisPost.saveMultiple(user, res.data.posts || [], [], null)
            });
        })
      },


      saveMultiple: function (user, posts, document_ids, deferred) {
        thisPost = this
        if (!deferred)
          deferred = $q.defer();

        if (posts.length == 0) {
          return deferred.resolve(document_ids)
        } else {
          post = posts.shift();
          doc_id = thisPost.documentID(user, post)
          return thisPost.save(doc_id, post, { remote: false, synced: true }).then(function (doc) {
            document_ids.push(doc_id)
            return thisPost.saveMultiple(user, posts, document_ids, deferred)
          })

          return deferred.promise;
        }
      },

      sendToCloud: function (changes) {
        return User.get().then(function (user) {
          return cordovaHTTP.put(denguechat.env.baseURL + 'sync/post', { changes: changes },
            { 'Authorization': 'Bearer ' + user.token });
        });
      },

      syncUnsyncedDocuments: function () {
        if (this.timeout) {
          backoff.reset()
          clearTimeout(this.timeout)
        }

        thisPost = this
        Pouch.postsDB.changes({
          include_docs: false,
          conflicts: false,
          filter: function (doc) {
            return !doc.synced
          }
        }).then(function (changes) {
          if (changes.results.length > 0) {
            console.log("Changes still to be synced:")
            console.log(changes)
            console.log("------")
            thisPost.syncMultiple(changes.results)
          }
        })
      },

      syncMultiple: function (documents) {
        thisPost = this

        duration = backoff.duration()
        console.log("Running syncMultiple with documents:")
        console.log(documents)
        console.log("-----")

        doc = documents.shift()
        if (doc) {
          setTimeout(function () {
            thisPost.sendChangesToCloud(doc.id).then(function (doc) {
              backoff.reset()
              thisPost.syncMultiple(documents)
            })
          }, duration)
        }
      },

      sync: function (document_id) {
        thisPost = this

        duration = backoff.duration()
        console.log("Current backoff duration is: ")
        console.log(duration)
        console.log("-----")

        this.timeout = setTimeout(function () {
          thisPost.sendChangesToCloud(document_id)
        }, duration);
      },

      unsyncedChanges: function () {
        return Pouch.postsDB.changes({
          include_docs: true,
          conflicts: false,
          filter: function (doc) { return !doc.synced }
        }).then(function (changes) {
          return changes.results
        })
      },

      sendChangesToCloud: function (document_id) {
        thisPost = this;
        return Pouch.postsDB.get(document_id).then(function (post) {
          console.log("Sync starting for document:")
          console.log(post)

          // TODO: REmove last sync sec
          return Pouch.postsDB.changes({
            include_docs: true,
            conflicts: false,
            doc_ids: [post._id],
            filter: function (doc) {
              return !doc.synced
            }
          }).then(function (changes) {
            if (changes.results.length > 0) {
              console.log("Changes to be sent to the cloud:")
              console.log(changes)
              console.log("-----")

              return thisPost.sendToCloud(changes).then(function (res) {
                console.log("Successful response form cloud...")
                console.log(res)
                console.log("------")

                // Reset backoff.
                backoff.reset();

                // Update the post model.
                for (var key in res.data.post) {
                  post[key] = res.data.post[key]
                }
                post.synced = true
                post.last_synced_at = res.data.last_synced_at
                return Pouch.postsDB.put(post)
              }, function (res) {
                console.log("Failed with error:");
                console.log(res)
                thisPost.syncStatus.error = res;
                console.log("------")
                thisPost.sync(post._id)
              })
            }
          })



        }).catch(console.log.bind(console));

      },

      updateSyncState: function (sync_state) {
        return Pouch.syncDB.upsert("posts", function (state) {
          state.last_synced_at = sync_state.last_synced_at
          state.last_sync_seq = sync_state.last_sync_seq
          return state
        })
      },
      saveLastSeq: function () {
        return Pouch.postsDB.changes().then(function (changes) {
          return Pouch.syncDB.upsert("posts", function (doc) {
            doc.last_sync_seq = changes.last_seq
            return doc
          })
        })
      }

    };
  })
