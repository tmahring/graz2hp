'use strict';

/**
 * @ngdoc directive
 * @name graz2App.directive:fullheight
 * @description
 * # fullheight
 */
angular.module('graz2App')
  .directive('fullheight', function ($window) {
    return function (scope, element) {
      var w = angular.element($window);

      element.css('height', w.height());

      w.bind('resize', function () {
        element.css('height', w.height());
      });
    };
  });
