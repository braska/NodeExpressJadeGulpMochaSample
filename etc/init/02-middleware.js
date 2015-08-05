var path = require('path');
var express = require('express');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var httpLogger = require('morgan');

exports = module.exports = function(IoC, logger, config) {

  var app = this;

  if (config.logger.requests) {
    app.use(httpLogger('dev'));
  }

  // parse request bodies
  // support _method (PUT in forms etc)
  app.use(
    bodyParser.json(),
    bodyParser.urlencoded({
      extended: true
    }),
    cookieParser(),
    methodOverride('_method'),
    express.static(path.join(__dirname, '..', '..',  'public'))
  );

};

exports['@require'] = ['$container', 'logger', 'config'];
