var request = require('supertest'),
    app = require('../app');

describe('GET /', function () {
    it('200 - ok', function (done) {
        request(app)
            .get('/')
            .expect(200, done);
    });
});