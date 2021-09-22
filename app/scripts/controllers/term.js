'use strict';

/**
 * @ngdoc function
 * @name graz2App.controller:TermCtrl
 * @description
 * # TermCtrl
 * Controller of the graz2App
 */
angular.module('graz2App')
  .controller('TermCtrl', function ($scope, config, $http) {
    $http.get(config.cmsUrl + '/termine?_format=json').then(
      function success(result) {
        $scope.events = [];
        angular.forEach(result.data, function(entry) {
          entry.stufe = entry.stufe.split(', ');

          if(entry.zeitanzeige === '1') {
            if(entry.ende !== '') {
              if(moment(entry.beginn).isSame(entry.ende, 'day')) {
                entry.date1 = moment(entry.beginn).format('Do MMM');
                entry.date2 = moment(entry.beginn).format('H:mm') + ' bis ' + moment(entry.ende).format('H:mm') + ' Uhr';
              } else {
                entry.date1 = moment(entry.beginn).format('Do MMM H:mm') + ' Uhr';
                entry.date2 = 'bis ' + moment(entry.ende).format('Do MMM H:mm') + ' Uhr';
              }
            } else {
              entry.date1 = moment(entry.beginn).format('Do MMM');
              entry.date2 = moment(entry.beginn).format('H:mm') + ' Uhr';
            }
          } else {
            if(entry.ende !== '') {
              entry.date1 = moment(entry.beginn).format('Do MMM');
              entry.date2 = 'bis ' + moment(entry.ende).format('Do MMM');
            } else {
              entry.date1 = moment(entry.beginn).format('Do MMM');
            }
          }

          entry.body = entry.body.replace('src="/cms/sites', 'src="http://graz2.tmweb.at/cms/sites');

          $scope.events.push(entry);
        });
      }
    );
  });
