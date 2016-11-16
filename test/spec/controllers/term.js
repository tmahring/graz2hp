'use strict';

describe('Controller: TermCtrl', function () {

  // load the controller's module
  beforeEach(module('graz2App'));

  var TermCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TermCtrl = $controller('TermCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(TermCtrl.awesomeThings.length).toBe(3);
  });
});
