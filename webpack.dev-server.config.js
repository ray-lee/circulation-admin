const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware");

const merge = require("webpack-merge");
const { URL } = require("url");
const dev = require("./webpack.dev.config.js");

const devAssetsPublicPath = '/webpack-dev-assets/';

module.exports = (env) => {
  const { backend } = env;

  if (!backend) {
    console.error("Please specify the URL of a Circulation Manager back-end.");
    console.error("Example: npm run dev-server -- --env=backend=https://gorgon.tpp-qa.lyrasistechnology.org");

    throw("No back-end URL was specified.")
  }

  console.info(`Using Circulation Manager back-end: ${backend}`);

  const backendUrl = new URL(backend);

  const rewriteLocationHeader = (res, req) => {
    const location = res.getHeader("location");

    if (!location) {
      return;
    }

    const locationUrl = new URL(location);

    if (locationUrl.host !== backendUrl.host) {
      return;
    }

    const requestHost = req.headers.host;

    if (!requestHost) {
      return;
    }

    locationUrl.protocol = "http";
    locationUrl.host = requestHost;

    const redirectParam = locationUrl.searchParams.get("redirect");

    if (redirectParam) {
      const redirectUrl = new URL(redirectParam);

      if (redirectUrl.host == backendUrl.host) {
        redirectUrl.protocol = "http";
        redirectUrl.host = requestHost;

        locationUrl.searchParams.set("redirect", redirectUrl.href);
      }
    }

    res.setHeader("location", locationUrl.href);
  };

  const rewriteOPDS = (responseBuffer, req) => {
    const requestHost = req.headers.host;

    if (!requestHost) {
      return responseBuffer;
    }

    const feed = responseBuffer.toString("utf8");

    return feed.replace(
      new RegExp(backendUrl.origin, "g"),
      `http://${requestHost}`
    );
  };

  const rewriteHTML = (responseBuffer, req) => {
    const requestHost = req.headers.host;

    if (!requestHost) {
      return responseBuffer;
    }

    const page = responseBuffer.toString("utf8");
    const packageName = process.env.npm_package_name;
    const cdnUrlPattern = `"https://cdn.jsdelivr.net/npm/${packageName}(@.*?)?/dist/(.*?)"`;

    return page.replace(
      new RegExp(cdnUrlPattern, "g"),
      `"http://${requestHost}${devAssetsPublicPath}$2"`
    );
  };

  const proxyMiddleware = createProxyMiddleware({
    changeOrigin: true,
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        rewriteLocationHeader(res, req);

        const contentType = res.getHeader("content-type");

        if (contentType.startsWith("application/atom+xml")) {
          return rewriteOPDS(responseBuffer, req);
        }

        if (contentType.startsWith("text/html")) {
          return rewriteHTML(responseBuffer, req);
        }

        return responseBuffer;
      }
    ),
    proxyTimeout: 5000,
    secure: false,
    selfHandleResponse: true,
    target: backend,
    timeout: 5000,
  });

  const config = merge(dev, {
    devServer: {
      onAfterSetupMiddleware: (devServer) => {
        devServer.app.use("/", proxyMiddleware);
      },
    },
    output: {
      publicPath: devAssetsPublicPath,
    },
  });

  return config;
};
