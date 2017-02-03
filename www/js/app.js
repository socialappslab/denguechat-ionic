// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('starter.services', [])

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'ngSanitize', 'underscore', 'Backo'])

.run(function($ionicPlatform, $rootScope, $ionicModal, User, $state, $ionicHistory, Pouch, Post, Location) {
  $rootScope.user = User.get()

  Pouch.createPostNeighborhoodView()
  Pouch.createLocationNeighborhoodView()

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

    // Pouch.postsDB.destroy()
    // Pouch.locationsDB.destroy()
    // User.set("")

    // If this runs, that means we're restarting the app after a crash, or loading it into memory again.
    // Check the database for any items that didn't sync, and try to sync them.
    Post.syncUnsyncedDocuments()
    Location.syncUnsyncedDocuments()
  });


  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
    // Let's ensure that we have user data.
    var user = User.get()
    if (!user.neighborhood) {
      event.preventDefault()
      User.setToken("")
      $rootScope.$emit(denguechat.env.error, {error: {status: 401}})
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
    if (response.status == -1) {
      navigator.notification.alert("We couldn't connect to the server. Do you have an internet connection?", null, "Server not responding", "OK")
    }
    else if (response.error.status == 401) {
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
        $state.go("app.posts", {}, {reload: true})
        // $rootScope.$broadcast(denguechat.env.data.refresh);
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
  $urlRouterProvider.otherwise('/app/posts')
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.posts', {
    url: '/posts',
    views: {
      'menuContent': {
        templateUrl: 'templates/posts/index.html',
        controller: 'postsCtrl'
      }
    }
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
    url: '/visit/:visit_id',
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
  .state('app.location', {
    url: '/location/:id',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/locations/show.html',
        controller: 'locationCtrl'
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
  .state('app.location.visit', {
    url: '/visits/:visit_id',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/visits/show.html',
        controller: 'visitCtrl'
      }
    }
  })
  .state('app.location.visit.edit', {
    url: '/edit',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/visits/edit.html',
        controller: 'editVisitCtrl'
      }
    }
  })
  .state('app.location.new_visit', {
    url: '/new_visit',
    views: {
      'menuContent@app': {
        templateUrl: 'templates/locations/new_visit.html',
        controller: 'newVisitCtrl'
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
})


// The only difference between our linky and the "linky" is that we're
// not sanitizing the HTML in order to allow for @dmitri mentions.
.filter('denguechatLinky', [function() {
  var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
      MAILTO_REGEXP = /^mailto:/i;

  return function(text, target) {
    if (!text) return text;
    var match;
    var raw = text;
    var html = [];
    var url;
    var i;

    // console.log(raw.match(/(<a href=')/i))
    // TODO: Make sure that href=/ becomes ng-click="something"
    // match = raw.match(/(<a href=')/i)
    // url = match[0];
    // i = match.index;
    // raw = url + "#" + raw.substring(i + match[0].length)
    // console.log(raw)



    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/www/mailto then assume mailto
      if (!match[2] && !match[4]) {
        url = (match[3] ? 'http://' : 'mailto:') + url;
      }
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return html.join('');

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(text);
    }

    function addLink(url, text) {
      html.push('<a ');
      if (angular.isDefined(target)) {
        html.push('target="',
                  target,
                  '" ');
      }
      html.push('href="',
                url.replace(/"/g, '&quot;'),
                '">');
      addText(text);
      html.push('</a>');
    }
  };
}]);
