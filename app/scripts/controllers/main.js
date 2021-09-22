'use strict';

/**
 * @ngdoc function
 * @name graz2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the graz2App
 */
angular.module('graz2App')
  .controller('MainCtrl', function ($scope, $http, config, $q, urlString) {
    var leiterQ = $q(function(resolve) {
      $http.get(config.cmsUrl + '/leiter?_format=json').then(
        function success(result) {
          resolve(result.data);
        }
      );
    });

    $http.get(config.cmsUrl + '/stufen?_format=json').then(
      function success(result) {
        $scope.stufen = [];

        function assignLeiter(stufe, leiter) {
          stufe.leiter = [];
          for(var i = 0; i < leiter.length; i++) {
            if(leiter[i].stufe.indexOf(stufe.stufe) !== -1) {
              stufe.leiter.push(leiter[i]);
            }
          }
        }

        function shuffleArray(array) {
          for (var i = array.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var temp = array[i];
              array[i] = array[j];
              array[j] = temp;
          }
          return array;
        }

        angular.forEach(result.data, function(stufe) {
          leiterQ.then(function(leiter) {
            assignLeiter(stufe, leiter);
            shuffleArray(stufe.leiter);
            $scope.stufen.push(stufe);
          });
          switch(stufe.stufe) {
            case 'biber' :
              stufe.heading = '<h1 class="text-center">Biber</h1>';
              stufe.leiterHeading = 'Unsere Biber - Leiter';
              break;
            case 'wiwo' :
              stufe.heading = '<h1><span class="text-left">Wichtel</span><span class="title-mid">und</span><span class="text-right">Wölflinge</span></h1>';
              stufe.leiterHeading = 'Unsere WiWö - Leiter';
              break;
            case 'gusp' :
              stufe.heading = '<h1><span class="text-left">Guides</span><span class="title-mid">und</span><span class="text-right">Späher</span></h1>';
              stufe.leiterHeading = 'Unsere GuSp - Leiter';
              break;
            case 'caex' :
              stufe.heading = '<h1><span class="text-left">Caravelles</span><span class="title-mid">und</span><span class="text-right">Explorer</span></h1>';
              stufe.leiterHeading = 'Unsere CaEx - Leiter';
              break;
            case 'raro' :
              stufe.heading = '<h1><span class="text-left">Ranger</span><span class="title-mid">und</span><span class="text-right">Rover</span></h1>';
              stufe.leiterHeading = 'Unsere RaRo - Leiter';
              break;
            case 'gruppe' :
              stufe.heading = '<h1><span class="text-left">Gruppenleitung</span><span class="title-mid">und</span><span class="text-right">Elternrat</span></h1>';
              stufe.leiterHeading = 'Unsere Gruppenleitung';
          }
        });
      }
    );

    function formatStufe(stufe) {
      switch(stufe) {
        case 'biber' :
          return {txt: 'Biber', url: 'biber'};
        case 'wiwo' :
          return {txt: 'WiWö', url: 'wiwo'};
        case 'gusp' :
          return {txt: 'GuSp', url: 'gusp'};
        case 'caex' :
          return {txt: 'CaEx', url: 'caex'};
        case 'raro' :
          return {txt: 'RaRo', url: 'raro'};
        case 'gruppe' :
          return {txt: 'Gruppe', url: 'gruppe'};
      }
    }

    $http.get(config.cmsUrl + '/highlights?_format=json').then(
      function success(result) {
        $scope.highlights = [];
        angular.forEach(result.data, function(entry) {
          entry.url = urlString(entry.title);
          entry.stufe = entry.stufe.split(', ');
          for(var i = 0; i < entry.stufe.length; i++) {
            entry.stufe[i] = formatStufe(entry.stufe[i]);
          }

          if(entry.beginn !== '') {
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

            entry.type = 'termin';
          }
          else {
            entry.type = 'news';
          }

          $scope.highlights.push(entry);
        });
      }
    );
  });
