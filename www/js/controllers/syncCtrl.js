angular.module('starter.controllers')
.controller('syncCtrl', ['$scope', 'Location', "Post", "Visit", "Inspection", "Pouch", "$ionicLoading", "$state", function($scope, Location, Post, Visit, Inspection, Pouch, $ionicLoading, $state) {
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

  $scope.destroyDatabases = function() {
    t = window.confirm("This will destroy all databases. Are you sure?")
    if (!t)
      return false

    return Pouch.postsDB.destroy().then(function() {
      return Pouch.locationsDB.destroy()
    }).then(function() {
      return Pouch.visitsDB.destroy()
    }).then(function() {
      return Pouch.inspectionsDB.destroy()
    }).then(function() {
      $state.go("app.sync", {}, {reload: true})
    }).catch(function(err) {
      alert("Something went wrong while destroy databases. Here is the error: " + JSON.stringify(err))
    })
  }


  // Triggered only once when the view is loaded.
  // http://ionicframework.com/docs/api/directive/ionView/
  $scope.$on("$ionicView.loaded", function() {
    $ionicLoading.show({template: "<ion-spinner></ion-spinner><br>Loading database...", hideOnStateChange: true})

    Post.unsyncedChanges().then(function(changes) {
      $scope.posts = changes
      $scope.post.syncStatus = Post.syncStatus
    }).then(function() {
      return Location.unsyncedChanges().then(function(changes) {
        $scope.locations = changes
        $scope.location.syncStatus = Location.syncStatus
      })
    }).then(function() {
      return Visit.unsyncedChanges().then(function(changes) {
        $scope.visits = changes
        $scope.visit.syncStatus = Visit.syncStatus
      })
    }).then(function() {
      $ionicLoading.hide()

      return Inspection.unsyncedChanges().then(function(changes) {
        $scope.inspections = changes
        $scope.inspection.syncStatus = Inspection.syncStatus
      })
    }).catch(function(err) {
      alert("Something went wrong while loading changes. Here is the error: " + JSON.stringify(err))
    })

  })

  $scope.$watch("visit_last_known_error", function(n, o) {
    console.log(n)
    console.log(o)
    console.log("\n\n\n\n\n\n\n\n")
  })
}])
