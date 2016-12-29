angular.module('starter.controllers')
.controller('postsCtrl', ['$scope', 'Post', "$filter", function($scope, Post, $filter) {
  $scope.state = {loading: false};

  $scope.refresh = function() {
    Post.get(4, 20, 20).then(function(response) {
      $scope.posts = response.data.posts
      for (var i=0; i < $scope.posts.length; i++) {
        $scope.posts[i].content = $filter("denguechatLinky")($scope.posts[i].content, '_blank')
      }

    }, function(response) {
      $scope.$emit(denguechat.env.error, {error: response})
    }).finally(function() {
     $scope.state.loading = false;
    });
  }

  $scope.$on(denguechat.env.data.refresh, function() {
    $scope.state.loading = true
    $scope.refresh();
  })

  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
}])
