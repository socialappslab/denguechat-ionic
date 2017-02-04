angular.module('starter.controllers')
.controller('postsCtrl', ['$scope', 'Post', "$ionicModal", "$ionicLoading", function($scope, Post, $ionicModal, $ionicLoading) {
  $scope.state = {loading: false, hasMoreData: false};
  $scope.posts = [];
  $scope.post  = {};

  $scope.toggleLike = function(post) {
    Post.like(post)
  }

  $scope.refresh = function(offset) {
    $ionicLoading.show({hideOnStateChange: true})

    Post.getFromCloud(20, offset).then(function(response) {
      Post.getAll().then(function(posts) {
        $scope.posts = posts
        $ionicLoading.hide()
        $scope.$broadcast('scroll.refreshComplete');
      }, function(er) {console.log("ERRORR"); console.log(JSON.stringify(er))})


      // Array.prototype.push.apply($scope.posts, response.data.posts)
      // $scope.$broadcast('scroll.infiniteScrollComplete');
      // $scope.state.hasMoreData = (response.data.posts.length !== 0)
    }, function(response) {
      $ionicLoading.hide()
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$emit(denguechat.env.error, {error: response})
    });
  }

  $scope.loadMore = function() {
    offset = $scope.posts.length
    $scope.refresh(offset)
  }

  $scope.showNewPostModal = function() {
    // Create the login modal that we will use later
    return $ionicModal.fromTemplateUrl('templates/posts/new.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true,
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
      modal.show()
    });
  }

  $scope.closeNewPostModal = function() {
    $scope.modal.hide().then(function() {
      $scope.modal.remove();
    })
  }

  $scope.loadCamera = function() {
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.post.compressed_photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(response) {
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }

  $scope.createPost = function() {
    $ionicLoading.show()

    $scope.post.created_at = new Date()
    $scope.post.user_id    = user.id
    $scope.post.neighborhood_id = $scope.user.neighborhood.id;
    doc_id = Post.documentID($scope.post)
    Post.save(doc_id, $scope.post, {remote: true, synced: false}).then(function(response) {
      Post.get(doc_id).then(function(doc) {
        console.log("New post: ")
        console.log(doc)
        console.log("----")
        $scope.posts.unshift(doc)

        $scope.post = {}
        $ionicLoading.hide().then(function() {
          $scope.closeNewPostModal()
        })
      })

    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: "Something went wrong. Please try again."})
      $ionicLoading.hide()
    })
  }


  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.refresh(0);
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({hideOnStateChange: true})
    Post.getAll().then(function(posts) {
      $scope.posts = posts
      $ionicLoading.hide()
    }, function(error) {
      $ionicLoading.hide()
    })
  })
}])
