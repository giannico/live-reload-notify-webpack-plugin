# live-reload-notify-webpack-plugin

A webpack plugin for notifying a LiveReload server of changed webpack output assets.

I created this plugin to be used in the following development scenario:

* Gulp/Grunt starts a tiny-lr server.
* Express configured with webpack-dev-middleware.
* Single-page application (Angular) running on the client.

Since webpack-dev-middleware maintains a copy of webpack outputs in memory, I couldn't figure out a watch to trigger LiveReload when those in-memory assets changed. The popular solution seems to be to run the LiveReload server within the express server (where you can get a hook to the server instance, and notify it of reloads). This solution works - however, I typically use nodemon on the server when doing fullstack development. As a result, each time I restarted the server, I had to incur the overhead of restarting the LiveReload server as well. Additionally, I wanted to find a solution for performing css update injection (without requiring a full page refresh).

Thankfully, tiny-lr provides a RESTful API for requesting a LiveReload. This plugin looks for assets that change with each webpack-dev-middleware rebuild, and notifies the LiveReload server of only the assets that have changed.

## Usage

``` javascript
var LiveReloadNotifyPlugin = require('live-reload-notify-webpack-plugin');

webpackConfig.plugins.push(new LiveReloadNotifyPlugin({
    port: buildConfig.options.liveReloadPort,
    ignoreFirstRun: true,
    logFn: console.log
}));
```

## Options

``` javascript
var defaultOptions = {
    port: 35729,         // the port where LiveReload is running
    ignoreFirstRun: true // choice of whether to notify LiveReload the first time a webpack build runs,
    logFn: function() {}   // function used to output which files that have changed
};
```
