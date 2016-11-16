'use strict';

describe('Service: demoContent', function () {

  // load the service's module
  beforeEach(module('graz2App'));

  // instantiate service
  var demoContent;
  beforeEach(inject(function (_demoContent_) {
    demoContent = _demoContent_;
  }));

  it('should do something', function () {
    expect(!!demoContent).toBe(true);
  });

});
