var requirejs = require('requirejs');

module.exports = function(id,depends,func) {
  //Check if there is a dependency array or if the function is the first arg
  if (typeof func === "undefined") {
    if (typeof depends === "undefined") {
        func = id;
        depends = [];
    } else {
        func = depends;
        depends = id;
    }
  }

  //Load the modules in depends
  var d = [];
  for (var i = 0; i < depends.length; i++) {
    var m;
    try { //Try tp load from a requirejs path
        m = require(requirejs.toUrl(depends[i]));
    } catch(e) { //Fallback to default require
        m = require(depends[i]);
    }
    d.push(m);
  }

  //Get the module
  var e = func.apply(this, d);

  //Find the id of he module that called define
  var err = new Error();
  var id = err.stack.split("\n")[2].match(/\((.*):\d*:\d*/)[1];

  require.cache[id].exports = e;
};

module.exports.config = function(c) {
  c.nodeRequire = require;
  requirejs.config(c);
};
