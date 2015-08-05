var express = require('express');
var bootable = require('bootable');
var IoC = require('electrolyte');

process.chdir(__dirname);

var app = bootable(express());


app.phase(bootable.di.initializers('etc/init'));
app.phase(bootable.di.routes('app/config/routes.js'));

app.phase(function(done) {
    app.listen(IoC.create('config').server.port, function() {
        var addr = this.address();
        IoC.create('logger').info('app listening on %s:%d', addr.address, addr.port);
        done();
    })
});

app.boot(function(err) {
    var logger = IoC.create('logger');
    if (err) {
        logger.error(err.message);
        logger.error(err.stack);

        process.exit(-1);
        return;
    }

    logger.info('app booted');

});

exports = module.exports = app;