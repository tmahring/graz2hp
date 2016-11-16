'use strict';

/**
 * @ngdoc overview
 * @name graz2App
 * @description
 * # graz2App
 *
 * Main module of the application.
 */
angular
  .module('graz2App', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'flexhelpers',
    'ipsum',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/news/:newsitem?', {
        templateUrl: 'views/news.html',
        controller: 'NewsCtrl',
        controllerAs: 'about',
        reloadOnSearch: false,
      })
      .when('/term', {
        templateUrl: 'views/term.html',
        controller: 'TermCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .constant('config', {
    cmsUrl: '/cms'
  })
  .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
  }])

 .directive('hideme', function($window, $document) {
   return function(scope, elem) {
     var hidden = false;
     $document.on('scroll', function() {
       if(!hidden && $window.scrollY > $(window).height() * 0.3) {
         elem.hide(400);
         hidden = true;
       }
       else if(hidden && $window.scrollY < $(window).height() * 0.3) {
         elem.show(400);
         hidden = false;
       }
     });
   };
 });
