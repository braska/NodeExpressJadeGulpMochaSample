var path = require('path');
var appPath = path.join(__dirname, '..', '..', 'app');
var config = require(path.join(appPath, 'config', 'config'));
var logger = require('winston');
var IoC = require('electrolyte');

module.exports = function() {
    IoC.singleton('config', config);
    IoC.singleton('logger', function() { return logger; });
    IoC.loader('controllers', IoC.node(path.join(appPath, 'controllers')));
    IoC.loader('models', IoC.node(path.join(appPath, 'models')));
};