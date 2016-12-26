// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('starter.services', [])

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicModal, User, $state, $ionicHistory) {
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

    if (!navigator.notification) {
      navigator.notification = window
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

  $rootScope.$on(denguechat.env.error, function(event, response) {
    if (response.error.status == 401) {
      User.setToken(null);

      if ( !$rootScope.modal || ($rootScope.modal && !$rootScope.modal.isShown()) ) {
        loadLoginModal().then(function() {
          $rootScope.state.error = "Your session has expired"
          $rootScope.modal.show();
        })
      }
    } else if (response.status !== -1 && response.error.data) {
      navigator.notification.alert(response.error.data.message, null, "Server not responding", "OK")
    } else if (response.error.status === 422 && response.error.data) {
      navigator.notification.alert(response.error.data.message, null, "Server not responding", "OK")
    } else if (response.error.status === -1) {
      navigator.notification.alert("We couldn't reach the server. Try again later.", null, "Server not responding", "OK")
    } else {
      navigator.notification.alert("Something went wrong", null, "Contact support@denguechat.com", "OK")
    }
  })

  $rootScope.$on(denguechat.env.auth.success, function(event, data) {
    User.setToken(data.token);

    if ($rootScope.modal)
      $rootScope.modal.remove().then(function() {
        $rootScope.$broadcast(denguechat.env.data.refresh);
      })
  })

  $rootScope.$on(denguechat.env.auth.failure, function(event, data) {
    User.setToken(null);
    if ( !$rootScope.modal || ($rootScope.modal && !$rootScope.modal.isShown()) ) {
      loadLoginModal().then(function() {
        $rootScope.state.error = data.message
        $rootScope.modal.show();
      })
    }
  })
})
.config(function($stateProvider, $urlRouterProvider) {
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/locations')
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.visits', {
    url: '/visits',
    views: {
      'menuContent': {
        templateUrl: 'templates/visits/index.html',
        controller: 'visitsCtrl'
      }
    }
  })
  .state('app.visit', {
    url: '/visit/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/visits/show.html',
        controller: 'visitCtrl'
      }
    }
  })
  .state('app.visits.new', {
    url: '/new',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/visits/new.html',
        controller: 'newVisitCtrl'
      }
    }
  })
  .state('app.locations', {
    url: '/locations',
    views: {
      'menuContent': {
        templateUrl: 'templates/locations/index.html',
        controller: 'locationsCtrl'
      }
    }
  })
  .state('app.locations.new', {
    url: '/new',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/locations/new.html',
        controller: 'newLocationCtrl'
      }
    }
  })
  .state('app.location.edit', {
    url: '/edit',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/locations/edit.html',
        controller: 'editLocationCtrl'
      }
    }
  })
  .state('app.location', {
    url: '/location/:id',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/locations/show.html',
        controller: 'locationCtrl'
      }
    }
  })
  .state('app.visit.new_inspection', {
    url: '/inspections/new',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/inspections/new.html',
        controller: 'newInspectionsCtrl'
      }
    }
  })
});
