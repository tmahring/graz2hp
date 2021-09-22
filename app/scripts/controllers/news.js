'use strict';

/**
 * @ngdoc function
 * @name graz2App.controller:NewsCtrl
 * @description
 * # NewsCtrl
 * Controller of the graz2App
 */
angular.module('graz2App')
  .controller('NewsCtrl', function ($scope, config, $http, $location, $routeParams) {
    $scope.setFilter = function(stufe) {
      if($scope.stufenFilter === stufe) {
        $scope.stufenFilter = undefined;
      }
      else {
        $scope.stufenFilter = stufe;
      }
      $location.search('stufe', stufe);
      $scope.$broadcast('FILTER_CHANGE');
    };

    $scope.newsitem = $routeParams.newsitem;

    if($location.search().stufe) {
      $scope.stufenFilter = $location.search().stufe;
    }

    $scope.newsFilter = function(entry) {
      if(typeof $scope.stufenFilter !== 'undefined') {
        return entry.stufe.indexOf($scope.stufenFilter) !== -1;
      }
      else {
        return true;
      }
    };

    $scope.$on('LOCATION_CHANGE', function(event, title) {
      var newPath = '/news';
      if(title !== '') {
        newPath += '/' + title;
      }
      if($location.path() !== newPath) {
        $location.path(newPath, false);
      }
    });

    $http.get(config.cmsUrl + '/news?_format=json').then(
      function success(result) {
        $scope.content = [];
        angular.forEach(result.data, function(entry) {
          entry.dateDisplay = moment(entry.created).fromNow();
          if(entry.galleryThumbs !== '') {
            entry.galleryThumbs = entry.galleryThumbs.split(', ');
            entry.galleryFull = entry.galleryFull.split(', ');
            entry.gallery = [];
            for(var i in entry.galleryThumbs) {
              entry.gallery.push({
                thumb: entry.galleryThumbs[i],
                full: entry.galleryFull[i]
              });
            }
          }
          else {
            entry.galleryThumbs = undefined;
          }
          entry.stufe = entry.stufe.split(', ');
          $scope.content.push(entry);
        });
      }
    );
  });
