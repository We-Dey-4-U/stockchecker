const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('Viewing one stock', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=msft')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  test('Viewing one stock and liking it', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=msft&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isTrue(res.body.stockData.likes > 0);
        done();
      });
  });

  test('Viewing the same stock and liking it again', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=msft&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isTrue(res.body.stockData.likes > 0);
        done();
      });
  });

  test('Viewing two stocks', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=msft&stock=goog')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        done();
      });
  });

  test('Viewing two stocks and liking them', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=msft&stock=goog&like=true')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.isTrue(res.body.stockData[0].likes > 0);
        assert.isTrue(res.body.stockData[1].likes > 0);
        done();
      });
  });
});