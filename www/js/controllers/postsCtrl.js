angular.module('starter.controllers')
.controller('postsCtrl', ['$scope', 'Post', "$filter", function($scope, Post, $filter) {
  $scope.state = {loading: false, hasMoreData: false};
  $scope.posts = []

  $scope.refresh = function(offset) {
    console.log("LOADING!")
    Post.get(4, 20, offset).then(function(response) {
      Array.prototype.push.apply($scope.posts, response.data.posts)
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.state.hasMoreData = (response.data.posts.length !== 0)
    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading = false;
    });
  }

  $scope.loadMore = function() {
    offset = $scope.posts.length
    $scope.refresh(offset)
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
