exports = module.exports = function() {

    function index(req, res, next) {
        res.format({
            html: function() {
                res.render('index', {title: 'Express'});
            },
            json: function() {
                res.status(200).end();
            }
        });
    }

    return {
        index: index
    };

};

exports['@singleton'] = true;