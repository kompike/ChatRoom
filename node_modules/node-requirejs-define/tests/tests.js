define = require('../index.js');
define.config({
  baseUrl: __dirname,
  paths: {
    'bar': 'lib/foo/bar',
    'biz': 'lib/foo/biz'
  }
});

test("Define without ID or dependencies", function() {
  var a = require('./lib/a');
  equal(a.a, 'a');
});

test("Define without ID and empty dependencies", function() {
  var b = require('./lib/b');
  equal(b.b, 'b');
});

test("Define with ID and empty dependencies", function() {
  var c = require('./lib/c');
  equal(c.c, 'c');
});

test("Define with dependencies", function() {
  var d = require('./lib/d');
  equal(d.d, 'abc');
});

test("Define with built-in dependencies", function() {
  var d = require('./lib/e');
  equal(d.d, 'abc');
});

test("multiple levels of defines", function() {
  var f = require('./lib/f');
  equal(f.f, 'abcdef');
});

test("Ensure modules don't get imported multiple times", function() {
  var i = require('./lib/inc');
  equal(i.inc(), 1);

  var i2 = require('./lib/inc2');
  equal(i2.i, 2);
});

test("Test paths", function() {
  var sum = require('./lib/sum');
  equal(sum.sum, 15);
});