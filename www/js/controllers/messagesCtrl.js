angular.module('starter.controllers')

.controller('conversationsCtrl', function($scope, Message) {
  $scope.providers = [];
  $scope.state     = {firstLoad: true};

  $scope.refresh = function() {
    Message.get().then(function(response) {
      $scope.providers = response.data.providers
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on(clovi.env.data.refresh, function() {
    $scope.state.firstLoad = true;
    $scope.refresh();
  })

  $scope.$on("$ionicView.loaded", function() {
    $scope.refresh();
  })
})


.controller('messagesCtrl', function($scope, Message, $state, $ionicScrollDelegate) {
  $scope.messages = [];
  $scope.provider = {};
  $scope.state  = {firstLoad: true, moreData: true};
  $scope.comment = {};

  var element         = angular.element(document.getElementsByClassName("messages-view"))
  var containerHeight = element[0].clientHeight

  window.addEventListener('native.keyboardshow', keyboardShowHandler);
  function keyboardShowHandler(e){
    element.css("height", (element[0].clientHeight - e.keyboardHeight) + "px")
    $ionicScrollDelegate.scrollBottom()
  }
  window.addEventListener('native.keyboardhide', keyboardHideHandler);
  function keyboardHideHandler(e){
    element.css("height", containerHeight + "px")
    $ionicScrollDelegate.scrollBottom()
  }


  $scope.refresh = function() {
    Message.get($state.params.provider_slug).then(function(response) {
      $scope.provider = response.data.provider
      $scope.messages = response.data.messages

      $ionicScrollDelegate.scrollBottom()
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    }).finally(function() {
     $scope.state.firstLoad = false;
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.createMessage = function() {
    Message.create($state.params.provider_slug, $scope.comment.content).then(function(response) {
      $ionicScrollDelegate.scrollBottom()
      $scope.comment = {};
      $scope.messages.push(response.data.message)
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    });
  }

  $scope.loadMore = function() {
    Message.getWithOffset($state.params.provider_slug, $scope.messages.length).then(function(response) {
      newMessages = response.data.messages;
      if (newMessages.length == 0)
        $scope.state.moreData = false;
      else
        for (var i=response.data.messages.length - 1; i >= 0; i--) {
          $scope.messages.unshift(response.data.messages[i])
        }
    }, function(response) {
      $scope.$emit(clovi.env.error, {error: response})
    }).finally(function() {
     $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on("$ionicView.afterEnter", function() {
    $scope.refresh();
  })
})
