'use strict';

describe('Directive: revolution', function () {

  // load the directive's module
  beforeEach(module('graz2App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<revolution></revolution>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the revolution directive');
  }));
});
