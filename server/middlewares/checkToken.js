/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

const { getNewToken } = require('../services/session');
const { clearAuthCookies, getValidCookieToken, normalizeToken } = require('../libs/token');

module.exports = async (ctx, next) => {
  const expire = ctx.cookies.get('expire');
  if (expire) {
    const current = new Date().getTime();
    if (expire <= current + 600000) {
      if (!normalizeToken(ctx.cookies.get('refreshToken'))) {
        clearAuthCookies(ctx);
        return await next();
      }

      const data = await getNewToken(ctx);
      if (data.token) {
        ctx.cookies.set('token', data.token);
        ctx.cookies.set('expire', data.expire);
        ctx.cookies.set('refreshToken', data.refreshToken);
        ctx.req.token = data.token;
      }
    }
  }

  ctx.req.token = ctx.req.token || getValidCookieToken(ctx);

  return await next();
};
