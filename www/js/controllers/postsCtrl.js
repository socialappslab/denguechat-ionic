angular.module('starter.controllers')
.controller('postsCtrl', ['$scope', 'Post', "$ionicModal", "$ionicLoading", "User", function($scope, Post, $ionicModal, $ionicLoading, User) {
  $scope.state = {loading: false, hasMoreData: false};
  $scope.posts = [];
  $scope.post  = {};

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Cargando los posts...", hideOnStateChange: true})

    User.get().then(function(user) {
      $scope.post.user_id = user.id
      $scope.post.user    = user
      $scope.post.neighborhood_id = user.neighborhood.id
    })

    Post.getAll().then(function(posts) {
      $scope.posts = posts
    }).catch(function(res) {
      $scope.$emit(denguechat.error, res)
    }).finally(function() {
      $ionicLoading.hide()
    })
  })

  $scope.toggleLike = function(post) {
    Post.like(post)
  }

  $scope.refresh = function(offset) {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Cargando los posts de denguechat.com...", hideOnStateChange: true})

    Post.getFromCloud(20, offset).then(function(response) {
      // Posts from cloud are insertedin couchDB in the getFromCloud callback
      return Post.getAll().then(function(posts) {
        $scope.posts = posts
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide()
      })

    }).catch(function(res) {
      $ionicLoading.hide()
      $scope.$emit(denguechat.env.error, res)
    })
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

  // $scope.showCommentsModal = function(post) {
  //   return $ionicModal.fromTemplateUrl('templates/posts/comments.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up'
  //   }).then(function(modal) {
  //     $scope.modal         = modal;
  //     return modal.show()
  //   }).then(function() {
  //     $ionicScrollDelegate.$getByHandle('commentContent').scrollBottom()
  //     $scope.status_update = post
  //   })
  // }

  $scope.closeModal = function() {
    $scope.post = {}
    if ($scope.modal) {
      $scope.modal.hide().then(function() {
        $scope.modal.remove();
      })
    }
  }

  $scope.loadCamera = function() {
    if (navigator.camera) {
      navigator.camera.getPicture(function(base64) {
        $scope.post.photo = "data:image/jpeg;base64," + base64
        $scope.$apply()
      }, function(response) {
      }, {saveToPhotoAlbum: true, destinationType: 0})
    } else {
      alert("Camera not supported!")
    }
  }

  $scope.createPost = function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Creando post...", hideOnStateChange: true})


    $scope.post.created_at      = new Date()
    doc_id = Post.documentID($scope.post.user, $scope.post)
    Post.save(doc_id, $scope.post, {remote: true, synced: false}).then(function(response) {
      return Post.get(doc_id).then(function(doc) {
        $scope.posts.unshift(doc)
        $scope.post = {};
        $ionicLoading.hide().then(function() {
          $scope.closeModal()
        })
      })
    }).catch(function(res) {
      $scope.$emit(denguechat.error, res)
    }).finally(function() {
      $ionicLoading.hide()
    })
  }


  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.refresh(0);
  })

}])
