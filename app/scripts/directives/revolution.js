'use strict';

/**
 * @ngdoc directive
 * @name graz2App.directive:revolution
 * @description
 * # revolution
 */
angular.module('graz2App')
  .directive('revolution', function ($compile) {
    return {
      template: '<div class="rev_slider_wrapper"><div class="rev_slider"><ul ng-transclude></ul></div></div>',
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: function($scope) {
        this.startRevolution = function() {
        $scope.slider.revolution({
            delay: 8000,
            hideThumbs: 0,
            fullWidth: 'on',
            fullScreen: 'on',
            fullScreenAlignForce: 'on',
            onHoverStop: 'off',
            hideCaptionAtLimit: '',
            dottedOverlay: 'twoxtwo',
            navigationStyle: 'round',
            fullScreenOffsetContainer: ''
          });
        };
      },
      link: function postLink(scope, element) {
        scope.slider = angular.element(element.find('.rev_slider')[0]);
      }
    };
  })
  .directive('revolutionSlide', function($timeout) {
    return {
      template: '<li><img data-lazyload="{{img}}" data-bgfit="cover" data-bgposition="center center" data-bgrepeat="no-repeat"></li>',
      transclude: true,
      replace: true,
      require: '^revolution',
      link: function(scope, element, attr, ctrl) {
        scope.img = attr.img;
        if(scope.$last) {
          $timeout(ctrl.startRevolution, 0);
        }
      }
    };
  });
