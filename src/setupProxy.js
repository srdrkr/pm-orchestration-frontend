const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://pm-orchestration-engine.vercel.app',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Add API key to all requests
        proxyReq.setHeader('X-API-Key', 'poe_api_2025_e84b49245f7da5ba01bdd679d7e40d1e475ddafdf972788994b0e8dfc5b76302');
        proxyReq.setHeader('Authorization', 'Bearer poe_api_2025_e84b49245f7da5ba01bdd679d7e40d1e475ddafdf972788994b0e8dfc5b76302');
        console.log('Proxying API request:', req.method, req.url, '→', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      }
    })
  );
  
  // Proxy health endpoint
  app.use(
    '/health',
    createProxyMiddleware({
      target: 'https://pm-orchestration-engine.vercel.app',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying health request:', req.method, req.url, '→', proxyReq.path);
      }
    })
  );
};