/**
 * Default options example
 *
 */

const koa = require('koa');
const route = require('koa-route');
const cors = require('koa-cors');

const app = new koa();

app.use(cors());

app.use(route.get('/', ctx => {
  ctx.body = { msg: 'Hello World!' };
}));

app.listen(3000);
