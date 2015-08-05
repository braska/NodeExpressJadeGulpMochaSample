exports = module.exports = function(IoC, config) {

  var app = this;

  // set the environment
  app.set('env', config.server.env);

  // set the default views directory
  app.set('views', config.views.dir);

  // set the default view engine
  app.set('view engine', config.views.engine);

  if (config.server.env === 'development') {

    // make view engine output pretty
    app.locals.pretty = true;

  }

  if (config.server.env === 'production') {
    app.enable('view cache');
  }

};

exports['@require'] = ['$container', 'config'];
