/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

const httpProxy = require('http-proxy');
const { getServerConfig } = require('../libs/utils');
const { isValidBearerToken } = require('../libs/token');

const { server: serverConfig, agent } = getServerConfig();

module.exports = function (app) {
  const wsProxy = httpProxy.createProxyServer({
    ws: true,
    changeOrigin: true,
    agent,
  });

  wsProxy.on('proxyReqWs', (proxyReq, req) => {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(new RegExp('(?:^|;)\\s?token=(.*?)(?:;|$)', 'i'));
    let token = '';

    try {
      token = match ? decodeURIComponent(match[1]) : '';
    } catch (error) {
      token = '';
    }

    if (isValidBearerToken(token)) {
      proxyReq.setHeader('Authorization', `Bearer ${token}`);
    }
  });

  app.server.on('upgrade', (req, socket, head) => {
    const target = serverConfig.apiServer.wsUrl;
    wsProxy.ws(req, socket, head, { target });
  });
};
