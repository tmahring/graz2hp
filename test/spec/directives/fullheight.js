'use strict';

describe('Directive: fullheight', function () {

  // load the directive's module
  beforeEach(module('graz2App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fullheight></fullheight>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fullheight directive');
  }));
});
