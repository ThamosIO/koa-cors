/**
 * Basic Auth and CORS
 *
 */

const koa = require('koa');
const route = require('koa-route');
const cors = require('koa-cors');

const app = new koa();

// cors
app.use(cors());

// custom 401 handling
app.use(async function (ctx, next){
  try {
    await next;
  } catch (err) {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = 'cant haz that';
    } else {
      throw err;
    }
  }
});

// require auth
app.use(auth({ name: 'tj', pass: 'tobi' }));

// secret response
app.use(async ctx => ctx.body = 'secret');

app.listen(3000);
console.log('listening on port 3000');
