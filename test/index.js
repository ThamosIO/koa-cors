const koa = require('koa');
const http = require('http');
const chai = require('chai');
const cors = require('../');
const superagent = require('superagent');

var server;

describe('cors()', () => {

  beforeEach(() => {
    setupServer();
  });

  it('should set "Access-Control-Allow-Origin" to "*"', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('*');

        done();
      });
  });

  it('should set "Access-Control-Allow-Origin" to "example.org"', done => {
    superagent.get('http://localhost:3000')
      .set('Origin', 'example.org')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('example.org');

        done();
      });
  });

  it('should update "Access-Control-Allow-Origin" for each request', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('*');

        superagent.get('http://localhost:3000')
          .set('Origin', 'localhost')
          .end(response => {
            chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('localhost');

            done();
          });
      });
  });

  it('should not set "Access-Control-Expose-Headers"', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Expose-Headers')).to.not.exist;

        done();
      });
  });

  it('should not set "Access-Control-Allow-Max-Age"', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Max-Age')).to.not.exist;

        done();
      });
  });

  it('should not set "Access-Control-Allow-Methods"', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Methods')).to.equal('GET,HEAD,PUT,POST,DELETE');

        done();
      });
  });

  it('should not set "Access-Control-Allow-Credentials"', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Credentials')).to.not.exist;

        done();
      });
  });

  it('should set "Access-Control-Allow-Headers" to "Accept"', done => {
    superagent.get('http://localhost:3000')
      .set('Access-Control-Request-Headers', 'Accept')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Headers')).to.equal('Accept');

        done();
      });
  });

  it('should set "Access-Control-Allow-Headers" to "X-Foo"', done => {
    superagent.get('http://localhost:3000')
      .set('Access-Control-Request-Headers', 'X-Foo')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Headers')).to.equal('X-Foo');

        done();
      });
  });

  it('should not fix value of "Access-Control-Allow-Headers"', done => {
    superagent.get('http://localhost:3000')
      .set('Access-Control-Request-Headers', 'X-Foo')
      .end(() => {
        superagent.get('http://localhost:3000')
          .set('Access-Control-Request-Headers', 'X-Bar')
          .end(response => {
            chai.expect(response.get('Access-Control-Allow-Headers')).to.equal('X-Bar');

            done();
          });
      });
  });

});

describe('cors({ origin: true })', () => {

  beforeEach(() => {
    setupServer({ origin: true });
  });

  it('should set "Access-Control-Allow-Origin" to "*"', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('*');

        done();
      });
  });

  it('should set "Access-Control-Allow-Origin" to "example.org"', done => {
    superagent.get('http://localhost:3000')
      .set('Origin', 'example.org')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('example.org');

        done();
      });
  });

});

describe('cors({ origin: false })', () => {

  beforeEach(() => {
    setupServer({ origin: false });
  });

  it('should not set any "Access-Control-Allow-*" header', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.not.exist;
        chai.expect(response.get('Access-Control-Allow-Methods')).to.not.exist;

        done();
      });
  });

});

describe('cors({ origin: [function]})', () => {

  beforeEach(() => {
    var originWhiteList = ["localhost", "otherhost.com"];

    var originFunction = function(req) {
      var origin = req.header.origin;
      if (originWhiteList.indexOf(origin) !== -1) {
        return origin;
      }
      return false;
    }

    setupServer({ origin: originFunction });
  });

  it('should not set any "Access-Control-Allow-*" header', done => {
    superagent.get('http://localhost:3000')
    .set('Origin', 'example.com')
      .end(response => {
        console.log(response);
        chai.expect(response.get('Access-Control-Allow-Origin')).to.not.exist;
        chai.expect(response.get('Access-Control-Allow-Methods')).to.not.exist;
        chai.expect(response.statusCode).to.equal(200);
        done();
      });
  });

  it('should set "Access-Control-Allow-Origin" to "otherhost.com"', done => {
    superagent.get('http://localhost:3000')
    .set('Origin', 'otherhost.com')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('otherhost.com');

        done();
      });
  });

  it('should set "Access-Control-Allow-Origin" to "localhost"', done => {
    superagent.get('http://localhost:3000')
    .set('Origin', 'localhost')
      .end(response => {
        chai.expect(response.get('Access-Control-Allow-Origin')).to.equal('localhost');

        done();
      });
  });

});

describe('cors({ expose: "Acccept,Authorization" })', () => {

  beforeEach(() => {
    setupServer({ expose: 'Accept,Authorization' });
  });

  it('should set "Access-Control-Expose-Headers" header', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Expose-Headers'))
          .to.equal('Accept,Authorization');

        done();
      });
  });

});

describe('cors({ expose: ["Accept", "Authorization"] })', () => {

  beforeEach(() => {
    setupServer({ expose: ['Accept', 'Authorization'] });
  });

  it('should set "Access-Control-Expose-Headers" header', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Expose-Headers'))
          .to.equal('Accept,Authorization');

        done();
      });
  });

});

describe('cors({ maxAge: 60 * 24 })', () => {

  beforeEach(() => {
    setupServer({ maxAge: 60 * 24 });
  });

  it('should set "Access-Control-Max-Age" header', done => {
    superagent.get('http://localhost:3000')
      .end(response => {
        chai.expect(response.get('Access-Control-Max-Age')).to.equal('1440');

        done();
      });
  });

});

afterEach(() => {
  server.close();
});

function setupServer(options) {
  const app = new koa();

  app.use(cors(options));

  app.use(async (ctx, next) => ctx.body = 'Hello');

  server = http.createServer(app.callback()).listen(3000);
}
