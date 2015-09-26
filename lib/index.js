'use strict';
var tinyLrNotifier = require('tiny-lr-notifier');
var _ = require('lodash');

module.exports = LiveReloadNotifyPlugin;

var DEFAULT_LIVE_RELOAD_HOST = 'localhost';
var DEFAULT_LIVE_RELOAD_PORT = 35729;

function LiveReloadNotifyPlugin(options) { // jshint ignore:line
    var opts = options || {};

    this.host = opts.host || DEFAULT_LIVE_RELOAD_HOST;
    this.port = opts.port || DEFAULT_LIVE_RELOAD_PORT;
    this.errorHandler = opts.errorHandler || noop;
    this.ignoreFirstRun = opts.ignoreFirstRun || false;
    this.logFn = opts.logFn || noop;

    this.lastHash = null;
    this.runCount = 0;

    // map of asset name to their contents (used in comparison to see if an asset changed)
    this.assets = {};
}

LiveReloadNotifyPlugin.prototype.done = function done(stats) {
    var that = this;
    var changedFiles = [];

    // check first run, if plugin is configured to ignore the first run
    var ignoreRun = this.runCount === 0 && this.ignoreFirstRun;

    // Iterate over each of the assets in the build
    _.forEach(stats.compilation.assets, function(asset, assetName) {
        var previousAssetContents = that.assets[assetName];
        var assetContents = getAssetContents(asset);

        // TODO: See if there's a better way to do this
        var assetHasChanged = !_.isEqual(previousAssetContents, assetContents);

        if (assetHasChanged) {
            changedFiles.push(assetName);
        }

        // update the asset contents, for the next comparison
        that.assets[assetName] = assetContents;
     });

    this.logFn('Changed files: ' + changedFiles.join(','));

    if (changedFiles.length > 0 && !ignoreRun) {
        tinyLrNotifier.
            notify(this.host, this.port, changedFiles).
            catch(this.errorHandler);
    }

    this.runCount++;
};

LiveReloadNotifyPlugin.prototype.failed = function failed() {
    _.forEach(this.assets, function(asset, assetName) {
        this.assets[assetName] = null;
    });
};

LiveReloadNotifyPlugin.prototype.apply = function apply(compiler) {
    this.compiler = compiler;

    compiler.plugin('done', this.done.bind(this));
    compiler.plugin('failed', this.failed.bind(this));
};

////////////////////////////////////////
/// Helper Functions
////////////////////////////////////////

// TODO: See if there's a better way to see if an asset changed
// Not sure if _value or children are reliable
function getAssetContents(asset) {
    var contents = null;

    if (asset._value) {
        contents = asset._value;
    } else if (asset.children) {
        contents = asset.children;
    } else if (asset._cachedSource) {
        contents = asset._cachedSource;
    }

    return contents;
}

function noop() {}