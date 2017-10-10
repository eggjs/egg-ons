'use strict';

const mm = require('egg-mock');

describe('test/ons.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'apps/ons-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mm.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, ons')
      .expect(200);
  });

  it('should GET /sendMessage', () => {
    return app.httpRequest()
      .get('/sendMessage')
      .expect('ok')
      .expect(200);
  });
});
