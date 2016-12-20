// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('starter.services', [])

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'luegg.directives'])

.run(function($ionicPlatform, $rootScope, $ionicModal, Participant, $state, $ionicHistory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  //----------------------------------------------------------------------------\

  $rootScope.state = {loading: false}

  //----------------------------------------------------------------------------\

  loadLoginModal = function() {
    // Create the login modal that we will use later
    return $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $rootScope,
      animation: 'slide-in-up',
      focusFirstInput: true,
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $rootScope.modal = modal;
    });
  }

  $rootScope.$on(clovi.env.error, function(event, response) {
    if (response.error.status == 401) {
      Participant.setToken(null);

      if ( !$rootScope.modal || ($rootScope.modal && !$rootScope.modal.isShown()) ) {
        loadLoginModal().then(function() {
          $rootScope.state.error = "Your session has expired"
          $rootScope.modal.show();
        })
      }
    } else if (response.error.status === -1) {
      navigator.notification.alert("We couldn't reach the server. Try again later.", null, "Server not responding", "OK")
    } else {
      navigator.notification.alert("Something went wrong", null, "Contact support@clovi.net", "OK")
    }
  })

  $rootScope.$on(clovi.env.auth.success, function(event, data) {
    Participant.setToken(data.token);

    if ($rootScope.modal)
      $rootScope.modal.remove().then(function() {
        $rootScope.$broadcast(clovi.env.data.refresh);
      })
  })

  $rootScope.$on(clovi.env.auth.failure, function(event, data) {
    Participant.setToken(null);
    if ( !$rootScope.modal || ($rootScope.modal && !$rootScope.modal.isShown()) ) {
      loadLoginModal().then(function() {
        $rootScope.state.error = data.message
        $rootScope.modal.show();
      })
    }
  })

  // The authentication hook that is triggered on every state transition.
  // We check if the user is logged-in, and if not, then we cancel the current
  // state transition and go to the login screen.
  // $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
  //   var token = Participant.getToken();
  //
  //   console.log(toState)
  //
  //   if (token && toState.name == "home") {
  //     console.log("HELLO")
  //     event.preventDefault();
  //     $state.go("app.conversations")
  //   } else if (!token && toState.name == "home") {
  //     event.preventDefault();
  //
  //     loadLoginModal().then(function() {
  //       $rootScope.modal.show();
  //     })
  //   }
  // });
})

.config(function($stateProvider, $urlRouterProvider) {
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/messages')

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html'
  })
  .state('app.conversations', {
    url: '/messages',
    views: {
      'menuContent': {
        templateUrl: 'templates/messages/index.html',
        controller: 'conversationsCtrl'
      }
    }
  })
  .state('app.messages', {
    url: '/messages/:provider_slug',
    views: {
      'menuContent': {
        templateUrl: 'templates/messages/show.html',
        controller: 'messagesCtrl'
      }
    }
  })
  //
  // .state('app.records', {
  //   url: '/records',
  //   views: {
  //     'menuContent': {
  //       templateUrl: 'templates/records/index.html',
  //       controller: 'recordsCtrl'
  //     }
  //   }
  // })
  .state('app.record', {
    url: '/record/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/records/show.html',
        controller: 'recordCtrl'
      }
    }
  })

  .state('app.events', {
    url: '/events',
    views: {
      'menuContent': {
        templateUrl: 'templates/events/index.html',
        controller: 'eventsCtrl'
      }
    }
  })
  .state('app.event', {
    url: '/events/:slug',
    views: {
      'menuContent': {
        templateUrl: 'templates/events/show.html',
        controller: 'eventCtrl'
      }
    }
  });
});
