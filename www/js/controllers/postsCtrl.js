angular.module('starter.controllers')
.controller('postsCtrl', ['$scope', 'Post', "$ionicModal", "$ionicLoading", function($scope, Post, $ionicModal, $ionicLoading) {
  $scope.state = {loading: false, hasMoreData: false};
  $scope.posts = []
  $scope.post  = {}

  $scope.toggleLike = function(post) {
    Post.like(post).then(function(response) {
      console.log(response)
      post.liked = response.data.liked
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading = false;
    });
  }

  $scope.refresh = function(offset) {
    Post.get(20, offset).then(function(response) {
      Array.prototype.push.apply($scope.posts, response.data.posts)
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.state.hasMoreData = (response.data.posts.length !== 0)
    }, function(response) {
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

  $scope.createPost = function() {
    $ionicLoading.show()

    $scope.post.neighborhood_id = 8

    Post.create($scope.post).then(function(response) {
      $scope.post = {}
      $ionicLoading.hide().then(function() {
        $scope.closeNewPostModal()
      })
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
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
    $scope.refresh(0);
  })
}])
