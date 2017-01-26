/*
This factory abstracts the interaction with the persistence layer to
fetch the Patient object. The Patient object is *mostly* Firebase data that
is returned via password authentication:

https://www.firebase.com/docs/web/guide/login/password.html
*/
angular.module('starter.services')
.factory('Post', function($q, $http, User, Pouch, Backoff, _) {
  var backoff = new Backoff({ min: 1000, max: 60000 });
  var whitelistedKeys = ["id", "user_id", "neighborhood_id", "photo", "content", "liked", "created_at"];


  // Pouch.postsDB.destroy()
  return {
    documentID: function(post) {
      return (new Date(post.created_at)).toISOString() + post.neighborhood_id
    },

    like: function(post) {
      post.liked = !post.liked
      return this.save(post._id, post, {remote: true, synced: false})
    },

    get: function(document_id) {
      return Pouch.postsDB.get(document_id)
    },

    getAll: function() {
      nid = User.get().neighborhood.id
      return this.findAllByNeighborhoodId(nid).then(function(doc) {
        docs = doc.rows.map(function(el) { return el.doc })
        return _.sortBy(docs, function(d){ return d._id; }).reverse();
      })
    },
    findAllByNeighborhoodId: function(neighborhood_id) {
      return Pouch.postsDB.query("posts/by_neighborhood_id", {
        key: neighborhood_id,
        include_docs: true
      })
    },


    // May actually be reusable for non-blob syncing stuff...
    save: function(doc_id, post, options) {
      thisPost = this
      if (options.remote == true)
        backoff.reset()

      // There should be at most one post for participant hence reusing this docID.
      //  TODO: Maybe this is where we run the 'util' function comparing last document ot current
      // and only storing the "diff"... Our custom diff function of sorts. See:
      // https://github.com/pouchdb/upsert#example-2
      return Pouch.postsDB.upsert(doc_id, function(doc){
        // NOTE: We only update if the new key exists AND it doesn't
        // equal what's stored in DB. This allows us to sync data bidirectionally
        // without overwriting with trivial values.
        changed = false
        for (var key in _.pick(post, whitelistedKeys)) {
          if (doc[key] != post[key]) {
            changed  = true
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

    getFromCloud: function(limit, offset) {
      thisPost = this
      nid = User.get().neighborhood.id
      return $http({
        method: "GET",
        url:    denguechat.env.baseURL + "posts?neighborhood_id=" + nid + "&limit=" + limit + "&offset=" + offset,
        headers: {
         "Authorization": "Bearer " + User.getToken()
       }
      }).then(function(res) {
        return thisPost.saveMultiple(res.data.posts, [], null)
      })
    },


    saveMultiple: function(posts, document_ids, deferred) {
      thisPost = this
      if (!deferred)
        deferred = $q.defer();

      if (posts.length == 0) {
        return deferred.resolve(document_ids)
      } else {
        post = posts.shift();
        doc_id = thisPost.documentID(post)
        console.log(doc_id)
        return thisPost.save(doc_id, post, {remote: false, synced: true}).then(function(doc) {
          document_ids.push(doc_id)
          return thisPost.saveMultiple(posts, document_ids, deferred)
        })

        return deferred.promise;
      }
    },

    sendToCloud: function(changes) {
      return $http({
        method: "PUT",
        url: denguechat.env.baseURL + "sync/post",
        data: {
          changes: changes
        },
        headers: {
          "Authorization": "Bearer " + User.getToken()
        }
      })
    },

    syncUnsyncedDocuments: function() {
      thisPost = this
      Pouch.postsDB.changes({
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
          thisPost.syncMultiple(changes.results)
        }
      })
    },

    syncMultiple: function(documents) {
      thisPost = this

      duration = backoff.duration()
      console.log("Running syncMultiple with documents:")
      console.log(documents)
      console.log("-----")

      doc = documents.shift()
      if (doc) {
        setTimeout(function(){
          thisPost.sendChangesToCloud(doc.id).then(function(doc) {
            backoff.reset()
            thisPost.syncMultiple(documents)
          })
        }, duration)
      }
    },

    sync: function(document_id) {
      thisPost = this

      duration = backoff.duration()
      console.log("Current backoff duration is: ")
      console.log(duration)
      console.log("-----")

      setTimeout(function(){
        thisPost.sendChangesToCloud(document_id)
      }, duration);
    },

    sendChangesToCloud: function(document_id) {
      return Pouch.postsDB.get(document_id).then(function(post) {
        console.log("Sync starting for document:")
        console.log(post)

        // TODO: REmove last sync sec
        return Pouch.postsDB.changes({
          include_docs: true,
          conflicts: false,
          // TODO: If we turn this on, we won't ever be able to match those that
          // are syncMultiple.
          // since: sync.last_sync_seq,
          doc_ids: [post._id],
          filter: function(doc) {
            return !doc.synced
          }
        }).then(function(changes) {
          if (changes.results.length > 0) {
            console.log("Changes to be sent to the cloud:")
            console.log(changes)
            console.log("-----")

            return thisPost.sendToCloud(changes).then(function(res) {
              console.log("Successful response form cloud...")
              console.log(res)
              console.log("------")

              // Reset backoff.
              backoff.reset();

              // Update the post model.
              post.synced         = true
              post.last_synced_at = res.last_synced_at
              return Pouch.postsDB.put(post)
            }, function(res) {
              console.log("Failed with error:");
              console.log(res)
              console.log("------")
              thisPost.sync(post._id)
            })
          }
        })



      })

    },


    syncStatus: function() {
      return Pouch.syncDB.get("posts")
    },
    updateSyncState: function(sync_state) {
      return Pouch.syncDB.upsert("posts", function(state) {
        state.last_synced_at = sync_state.last_synced_at
        state.last_sync_seq  = sync_state.last_sync_seq
        return state
      })
    },
    saveLastSeq: function() {
      return Pouch.postsDB.changes().then(function(changes) {
        return Pouch.syncDB.upsert("posts", function(doc) {
          doc.last_sync_seq = changes.last_seq
          return doc
        })
      })
    }

  };
})
