var _ = require('underscore');
var path = require('path');
var util = require('util');
var mergeDefaults = require('merge-defaults');

exports = module.exports = function() {
    var rootDir = path.join(__dirname, '..', '..');
    var appDir = path.join(rootDir, 'app');
    var viewsDir = path.join(appDir, 'views');

    var config = {
        defaults: {
            appName: "test",
            views: {
                dir: viewsDir,
                engine: 'jade'
            },
            publicDir: path.join(rootDir, 'public'),
            logger: {
                'console': true,
                requests: true,
                file: false
            }
        },
        development: {
            server: {
                env: 'development',
                port: 3000
            }
        },
        production: {
            server: {
                env: 'production',
                port: 3000
            }
        }
    };

    var settings = {};
    var env = process.env.NODE_ENV || 'development';

    if (!_.isObject(config[env]))
        throw new Error(util.format('Unknown environment %s', env));

    mergeDefaults(settings, config[env], config.defaults);

    return settings;
};

exports['@singleton'] = true;