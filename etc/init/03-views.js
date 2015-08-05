var moment = require('moment');

exports = module.exports = function(IoC, config) {

  var app = this;

  app.use(function(req, res, next) {
    res.locals.config = config;
    res.locals.req = req;
    res.locals.moment = moment;

    next();
  });

};

exports['@require'] = [ '$container', 'config' ];
