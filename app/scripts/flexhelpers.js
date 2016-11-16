'use strict';

/**
 * @ngdoc directive
 * @name graz2App.directive:fullheight
 * @description
 * # fullheight
 */
 angular.module('flexhelpers', [])
 .constant('urlString', function(string) {
    var urlString = string.toLowerCase();
    urlString = urlString.replace(/\s/gi, '-');
    urlString = urlString.replace(/ö/gi, 'oe');
    urlString = urlString.replace(/ä/gi, 'ae');
    urlString = urlString.replace(/ü/gi, 'ue');
    urlString = urlString.replace(/ß/gi, 'sz');
    urlString = urlString.replace(/[^-^\w\s]/gi, '');
    return urlString;
 })

 .directive('flexSlider', function ($timeout) {
   return {
     template: '<div style="display:block;postition:relative" ng-transclude></div>',
     transclude: true,
     replace: true,
     controller: function($scope) {
       var timer;
       $scope.slides = [];

       this.addSlide = function(slide) {
         $scope.slides.push(slide);
         if($scope.slides.length > 1) {
           slide.next = $scope.slides[0];
           slide.prev = $scope.slides[$scope.slides.length - 2];
           slide.prev.next = slide;
         }
       };

       $scope.nextSlide = function() {
         if($scope.slides) {
           $scope.showSlide($scope.currentSlide.next);
         }
       };

       $scope.prevSlide = function() {
         if($scope.slides) {
           $scope.showSlide($scope.currentSlide.prev);
         }
       };

       $scope.showSlide = function(slide) {
         if(!slide) {
           return;
         }
         $timeout.cancel(timer);
         slide.loaded(function() {
           if(typeof $scope.currentSlide !== 'undefined') {
             $scope.currentSlide.hide();
           }

           slide.display();
           $scope.currentSlide = slide;
           timer = $timeout($scope.nextSlide, slide.timeout);
           $scope.progressBar.css('width', '0px');
           $scope.progressBar.animate({'width' : '100%'}, {duration: slide.timeout, easing: 'linear', queue: false});
           slide.next.preload();
         });
       };

       $scope.$watch('slides.length', function() {
         $scope.showSlide($scope.slides[0]);
       });
     },
     link: function($scope, element) {
       $scope.progressBar = element.find('.slide-progress-indicator').find('.inner');
     }
   };
 })

 .directive('flexSliderSlide', function ($q) {
   return {
     template: '<div style="display:none;position:absolute;left:0px;right:0px;top:0px;bottom:0px" ng-transclude></div>',
     require: '^flexSlider',
     transclude: true,
     replace: true,
     scope: {
       img: '@'
     },
     link: function($scope, $element, $attr, $ctrl) {
       var loadingPromise;

       function preload() {
         if(typeof loadingPromise === 'undefined') {
           loadingPromise = $q(function(resolve) {
             var image = new Image();
             image.onload = function() {
               resolve();
             };
             image.src = $scope.img;
           });
         }
       }

       function loaded(next) {
         if(typeof loadingPromise === 'undefined') {
           preload();
         }
         loadingPromise.then(next);
       }

       function display() {
         $element.css('background-image', 'url('+$scope.img+')');
         $element.css('background-size', 'cover');
         $element.css('background-position', 'center');

         $element.css('z-index', 100);
         $element.css('opacity', 0);
         $element.css('display','block');
         $element.animate({'opacity' : 1}, {duration: 500, easing: 'linear', queue: false});
       }

       function hide() {
         $element.css('z-index', 90);
         $element.delay(500).hide(0);
       }

       $ctrl.addSlide({
         timeout: 10000,
         preload: preload,
         loaded: loaded,
         display: display,
         hide: hide
       });
     }
   };
 })

   .directive('fullheight', function ($window) {
     return function (scope, element, attr) {
       var w = angular.element($window);
       function height() {
         var h = w.height();
         if($.isNumeric(attr.fullheight)) {
           h += parseInt(attr.fullheight);
         }
         return h;
       }

       element.css('min-height', height());

       w.bind('resize', function () {
         element.css('min-height', height());
       });
     };
   })

   .controller('menuCtrl', function($scope, $location) {
     $scope.isCollapsed = true;
     $scope.toggleMenu = function() {
       $scope.isCollapsed = !$scope.isCollapsed;
     };
     $scope.setPath = function(path) {
       $scope.isCollapsed = true;
       $location.path(path);
       $(window).scrollTop(0);
     };
   })

   .directive('aspect', function ($window) {
     return function (scope, element, attr) {
       var aspectRatio = 1.0;
       var minsize = 0;

       if($.isNumeric(attr.aspect)) {
         aspectRatio = attr.aspect;
       }
       if($.isNumeric(attr.minsize)) {
         minsize = attr.minsize;
       }

       function height() {
         return angular.element(element).outerWidth() * aspectRatio;
       }

       angular.element($window).bind('resize', function() {
         if($(window).width() > minsize) {
           element.css('min-height', height());
         }
         else {
           element.css('min-height', '');
         }
       });

       scope.$watch(height, function() {
         if($(window).width() > minsize) {
           element.css('min-height', height());
         }
         else {
           element.css('min-height', '');
         }
       });
     };
   })

   .directive('gridView', function($compile, $timeout, urlString) {
     function newWrapperAnim(wrapper, content) {
       $timeout(function() {
         wrapper.animate({'height': content.outerHeight()}, {duration: 400, queue: false});
         content.animate({'opacity': 1}, {duration: 200, queue: false});
       }, 0);
     }

     function killWrapperAnim(wrapper, content) {
       $timeout(function() {
         content.animate({'opacity': 0}, {duration: 200, queue: false});
         wrapper.animate({'height': 0}, {duration: 400}, function() {wrapper.remove();});
       }, 0);
     }

     function changeContentAnim(wrapper, oldContent, newContent) {
       $timeout(function() {
         newContent.animate({'opacity': 1}, {duration: 200, queue: false});
         wrapper.animate({'height': newContent.outerHeight()}, {duration: 300, queue: false});
         oldContent.animate({'opacity': 0}, {duration: 200}, function() {oldContent.remove();});
       }, 0);
     }

     return {
       scope: {
         data: '=',
         selected: '@',
         filter: '=',
       },
       controller: function($scope) {
         var currentWrapper;
         var currentPositioner;
         var currentEntry;

         $scope.activate = function(entry) {
           if(entry === currentEntry) {
             $scope.close();
             return;
           }
           $scope.$emit('LOCATION_CHANGE', urlString(entry.title));

           var entryScope = $scope.$new();
           entryScope.entry = entry;
           var content = $scope.contentTemplate.clone();
           var contentPositioner = angular.element('<div style="position:absolute;left:0px;right:0px;top:0px;opacity:0"></div>');

           if(!currentEntry || currentEntry.element.offset().top !== entry.element.offset().top) {
             var wrapper = $scope.wrapperTemplate.clone();
             wrapper.css({'height':'0px', 'width':'100%', 'float':'right', 'position': 'relative'});
             wrapper.append(contentPositioner);
             contentPositioner.append(content);
             entry.element.after(wrapper);
             $compile(wrapper)(entryScope);

             if(!currentWrapper || currentWrapper.offset().top > entry.element.offset().top) {
               $('html,body').animate({scrollTop: entry.element.offset().top}, 600);
             }
             else {
               $('html,body').delay(600).animate({scrollTop: entry.element.offset().top - currentWrapper.outerHeight()}, 200);
             }

             newWrapperAnim(wrapper, contentPositioner);
             if(currentEntry) {
               killWrapperAnim(currentWrapper, currentPositioner);
             }

             currentWrapper = wrapper;
           }
           else {
             currentWrapper.append(contentPositioner);
             contentPositioner.append(content);
             $compile(currentWrapper)(entryScope);
             changeContentAnim(currentWrapper, currentPositioner, contentPositioner);
           }

           currentPositioner = contentPositioner;
           currentEntry = entry;
         };

         $scope.close = function() {
           killWrapperAnim(currentWrapper, currentPositioner);
           currentWrapper = undefined;
           currentPositioner = undefined;
           currentEntry = undefined;
           $scope.$emit('LOCATION_CHANGE', '');
         };

         $scope.$on('FILTER_CHANGE', function() {
           $scope.close();
           $scope.updateContent();
         });
       },
       compile: function(element) {
         var thumbTemplate = element.find('grid-thumb').clone();
         var wrapperTemplate = element.find('grid-full').clone();
         var contentTemplate = wrapperTemplate.children().clone();
         wrapperTemplate.empty();
         element.empty();

         return {
           post: function($scope, element) {
             $scope.thumbTemplate = thumbTemplate;
             $scope.wrapperTemplate = wrapperTemplate;
             $scope.contentTemplate = contentTemplate;
             $scope.wrapperTemplate.empty();

             $scope.updateContent = function() {
               element.empty();
               var lastElem;
               for(var i = 0; i < $scope.data.length; i++) {
                 if(typeof $scope.filter === 'function' && !$scope.filter($scope.data[i])) {
                   continue;
                 }
                 if(typeof lastElem !== 'undefined') {
                   $scope.data[i].prev = lastElem;
                   lastElem.next = $scope.data[i];
                 }
                 else {
                   $scope.data[i].prev = undefined;
                 }
                 $scope.data[i].next = undefined;
                 lastElem = $scope.data[i];

                 var entryScope = $scope.$new();
                 entryScope.entry = $scope.data[i];
                 entryScope.activate = $scope.activate;
                 $scope.data[i].element = $scope.thumbTemplate.clone();
                 element.append($scope.data[i].element);
                 $compile($scope.data[i].element)(entryScope);
               }
             };

             $scope.updateContent();
             for(var i = 0; i < $scope.data.length; i++) {
               if(urlString($scope.data[i].title) === $scope.selected) {
                 $scope.activate($scope.data[i]);
               }
             }
           }
         };
       }
     };
   })


   .directive('gridLoader', function($timeout) {
     function newWrapperAnim(wrapper, content) {
       $timeout(function() {
         wrapper.animate({'height': content.outerHeight()}, {duration: 400, queue: false, step: function() { wrapper.css({'overflow': 'visible'});}});
         content.animate({'opacity': 1}, {duration: 200, queue: false});
       }, 0);
     }

     function killWrapperAnim(wrapper, content) {
       $timeout(function() {
         content.animate({'opacity': 0}, {duration: 200, queue: false});
         wrapper.animate({'height': 0}, {duration: 400, step: function() { wrapper.css({'overflow': 'visible'});}}, function() {wrapper.remove();});
       }, 0);
     }

     function changeContentAnim(wrapper, oldContent, newContent) {
       $timeout(function() {
         newContent.animate({'opacity': 1}, {duration: 200, queue: false});
         wrapper.animate({'height': newContent.outerHeight()}, {duration: 300, queue: false, step: function() { wrapper.css({'overflow': 'visible'});}});
         oldContent.animate({'opacity': 0}, {duration: 200}, function() {oldContent.remove();});
       }, 0);
     }

     return {
       controller: function($scope) {
         var currentWrapper;
         var currentPositioner;
         var currentElement;

         this.showContent = function(element, content) {
           if(element === currentElement) {
             $scope.close();
             return;
           }

           var contentPositioner = angular.element('<div style="position:absolute;left:0px;right:0px;top:0px;opacity:0"></div>');

           if(!currentElement || currentElement.offset().top !== element.offset().top) {
             var wrapper = angular.element('<div style="height:0px;width:100%;float:right;position:relative;"></div>');
             wrapper.append(contentPositioner);
             contentPositioner.append(content);
             element.after(wrapper);
             element.show();

             newWrapperAnim(wrapper, contentPositioner);
             if(currentElement) {
               killWrapperAnim(currentWrapper, currentPositioner);
             }

             currentWrapper = wrapper;
           }
           else {
             currentWrapper.append(contentPositioner);
             contentPositioner.append(content);
             changeContentAnim(currentWrapper, currentPositioner, contentPositioner);
           }

           currentPositioner = contentPositioner;
           currentElement = element;
         };

         $scope.close = function() {
           killWrapperAnim(currentWrapper, currentPositioner);
           currentWrapper = undefined;
           currentPositioner = undefined;
           currentElement = undefined;
         };
       }
     };
   })

   .directive('gridLoaderTile', function() {
     return {
       controller: function($scope) {
         this.setContent = function(content) {
           $scope.content = content;
         };
       },
       require: '^gridLoader',
       link: function($scope, element, attr, ctrl) {
         $scope.activateContent = function() {
           ctrl.showContent(element, $scope.content);
         };
       }
     };
   })

   .directive('gridLoaderFull', function($compile) {
     return {
       require: '^gridLoaderTile',
       transclude: true,
       link: function($scope, element, attr, ctrl, transclude) {
         transclude(function(clone) {
           var wrapper = angular.element('<div></div>');
           wrapper.append(clone);
           $compile(wrapper)($scope);
           ctrl.setContent(wrapper);
           element.remove();
         });
       }
     };
   })

   .directive('imageBar', function($timeout) {
     return {
       template: '<div class="frame"><div class="slidee" ng-transclude></div></div>',
       transclude: true,
       replace: true,
       scope: true,
       controller: function($scope) {

         this.addWidth = function(width) {
           $scope.addWidth(width);
         };
       },
       link: function($scope, $element) {
         var sly = new Sly($($element), {
            horizontal: 1,
            smart: 1,
            //activateOn: 'click',
            mouseDragging: 1,
            touchDragging: 1,
            releaseSwing: 1,
            speed: 300,
            elasticBounds: 1,
          }).init();

        var totalWidth = 0;
        $scope.addWidth = function(width) {
          totalWidth += width;
          $element.find('.slidee').css('width', Math.ceil(totalWidth) + 'px');
          sly.reload();
        };
       }
     };
   })

   .directive('imageBarImage', function() {
     return {
       require: '^imageBar',
       scope: true,
       link: function($scope, $element, $attr, $ctrl) {
         var image = new Image();
         image.onload = function() {
           $element.append(image);
           $ctrl.addWidth($element.outerWidth());
         };
         image.src = $attr.imgSrc;
       }
     };
   });
