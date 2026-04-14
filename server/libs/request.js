/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

const request = require('./request.base');
const { getServerConfig } = require('./utils');
const { isValidBearerToken, normalizeToken } = require('./token');

const { server: serverConfig } = getServerConfig();

/**
 *  gateway api request, if get logined resource, token must exists,
 * @param {options} options: { token, method, url, params }
 */
const sendGatewayRequest = ({ method, url, params, token, headers = {}, ...rest }) => {
  const options = { headers: { ...headers }, ...rest };
  const bearerToken = isValidBearerToken(token) ? normalizeToken(token) : '';

  if (bearerToken) {
    options.headers = {
      ...headers,
      Authorization: `Bearer ${bearerToken}`,
      'content-type': headers['content-type'] || 'application/json',
      'x-client-ip': headers['x-client-ip'],
    };
  } else {
    delete options.headers.Authorization;
    delete options.headers.authorization;
  }

  return request[method.toLowerCase()](`${serverConfig.apiServer.url}${url}`, params, options);
};

module.exports = {
  sendGatewayRequest,
};
