/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

const isEmpty = require('lodash/isEmpty');
const isUndefined = require('lodash/isUndefined');
const { sendGatewayRequest } = require('../libs/request');
const { getValidCookieToken } = require('../libs/token');

module.exports = async (ctx, next) => {
  if (ctx.headers['x-check-exist']) {
    try {
      const url = ctx.url.replace('/proxy-api/', '/');
      ctx.body = await sendGatewayRequest({
        method: ctx.method,
        headers: ctx.headers,
        url,
        token: getValidCookieToken(ctx),
      });

      ctx.status = 200;

      // custom api rules
      if (!isUndefined(ctx.body.items)) {
        ctx.body = { exist: !isEmpty(ctx.body.items) };
        return;
      }

      if (!isUndefined(ctx.body.total)) {
        ctx.body = { exist: ctx.body.total > 0 };
        return;
      }

      if (!isUndefined(ctx.body.annotations)) {
        ctx.body = { exist: !!ctx.body.annotations };
        return;
      }

      if (!isUndefined(ctx.body.exist)) {
        ctx.body = { exist: ctx.body.exist };
        return;
      }

      ctx.body = { exist: true };
    } catch (error) {
      ctx.body = { exist: false };
    }
  } else {
    return await next();
  }
};
