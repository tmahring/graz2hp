'use strict';

/**
 * @ngdoc service
 * @name graz2App.demoContent
 * @description
 * # demoContent
 * Factory in the graz2App.
 */
angular.module('graz2App')
  .factory('demoContent', function (ipsumService) {
    // Service logic
    // ...

    var imgMax = 44;
    var maxPara = 5;
    var maxTitleLength = 5;

    var randImage = function() {
      return 'images/demo/' + Math.ceil(Math.random() * imgMax) + '.jpg';
    };

    var randText = function() {
      return ipsumService.paragraphs(Math.ceil(Math.random() * maxPara));
    };

    var randTitle = function() {
      return ipsumService.words(Math.ceil(Math.random() * maxTitleLength));
    };

    var randContent = function() {
      return {
        title: randTitle(),
        img: randImage(),
        body: randText(),
        abstract: ipsumService.paragraphs(1)
      };
    };

    var getContent = function(num) {
      var content = [];
      for(var i = 0; i < num; i++) {
        content.push(randContent());
      }
      return content;
    };

    // Public API here
    return {
      randImage : randImage,
      randText : randText,
      randTitle : randTitle,
      randContent : randContent,
      getContent : getContent
    };
  });
