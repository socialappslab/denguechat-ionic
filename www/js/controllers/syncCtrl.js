angular.module('starter.controllers')
.controller('syncCtrl', ['$scope', 'Location', "Post", "Visit", "Inspection", function($scope, Location, Post, Visit, Inspection) {
  $scope.post  = {};
  $scope.visit = {};
  $scope.location = {};
  $scope.inspection = {};
  $scope.state  = {firstLoad: true, loadingGeo: false};
  $scope.params = {search: ""};

  $scope.syncNow = function(type) {
    if (type == "locations")
      Location.syncUnsyncedDocuments()
    else if (type == "posts")
      Post.syncUnsyncedDocuments()
    else if (type == "visits")
      Visit.syncUnsyncedDocuments()
    else if (type == "inspections")
      Inspection.syncUnsyncedDocuments()
  }


  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    Post.unsyncedChanges().then(function(changes) {
      $scope.posts = changes
      $scope.post.syncStatus = Post.syncStatus
    })
    Location.unsyncedChanges().then(function(changes) {
      $scope.locations = changes
      $scope.location.syncStatus = Location.syncStatus
    })
    Visit.unsyncedChanges().then(function(changes) {
      $scope.visits = changes
      $scope.visit.syncStatus = Visit.syncStatus
    })
    Inspection.unsyncedChanges().then(function(changes) {
      $scope.inspections = changes
      $scope.inspection.syncStatus = Inspection.syncStatus
    })
  })

  $scope.$watch("visit_last_known_error", function(n, o) {
    console.log(n)
    console.log(o)
    console.log("\n\n\n\n\n\n\n\n")
  })
}])
