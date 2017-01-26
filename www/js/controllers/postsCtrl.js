angular.module('starter.controllers')
.controller('postsCtrl', ['$scope', 'Post', "$ionicModal", "$ionicLoading", function($scope, Post, $ionicModal, $ionicLoading) {
  $scope.state = {loading: false, hasMoreData: false};
  $scope.posts = [];
  $scope.post  = {user_id: $scope.user.id, neighborhood_id: $scope.user.neighborhood.id};

  $scope.toggleLike = function(post) {

    Post.like(post).then(function(res) {
      $scope.state.loading = false;
    }, function(response) {
      $scope.state.loading = false;
    });
  }

  $scope.refresh = function(offset) {
    Post.getFromCloud(20, offset).then(function(response) {
      console.log("Response: ")
      console.log(response)
      // Array.prototype.push.apply($scope.posts, response.data.posts)
      // $scope.$broadcast('scroll.infiniteScrollComplete');
      // $scope.state.hasMoreData = (response.data.posts.length !== 0)
    }, function(response) {
      console.log(response)
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading = false;
     $scope.$broadcast('scroll.refreshComplete');
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

    doc_id = Post.documentID($scope.post)
    Post.save(doc_id, $scope.post, {remote: true, synced: false}).then(function(response) {
      console.log(response)
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
    $scope.state.loading = true
    $scope.refresh(0);
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    Post.getAll().then(function(posts) {
      $scope.posts = posts
    })
  })
}])
