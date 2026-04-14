/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

const jwtDecode = require('jwt-decode');

const INVALID_TOKEN_VALUES = new Set(['undefined', 'null', '']);

const normalizeToken = token => {
  if (typeof token !== 'string') {
    return '';
  }

  const value = token.trim();
  return INVALID_TOKEN_VALUES.has(value.toLowerCase()) ? '' : value;
};

const isValidBearerToken = token => {
  const value = normalizeToken(token);

  if (!value) {
    return false;
  }

  const parts = value.split('.');
  return parts.length === 3 && parts.every(Boolean);
};

const getValidCookieToken = ctx => {
  const token = ctx?.cookies?.get('token');
  return isValidBearerToken(token) ? normalizeToken(token) : '';
};

const safeJwtDecode = token => {
  if (!isValidBearerToken(token)) {
    return null;
  }

  try {
    return jwtDecode(normalizeToken(token));
  } catch (error) {
    return null;
  }
};

const clearAuthCookies = ctx => {
  ctx.cookies.set('token', null);
  ctx.cookies.set('expire', null);
  ctx.cookies.set('refreshToken', null);
};

module.exports = {
  clearAuthCookies,
  getValidCookieToken,
  isValidBearerToken,
  normalizeToken,
  safeJwtDecode,
};
