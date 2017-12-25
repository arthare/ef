var fs = require('fs');
var assert = require('assert');


exports.config = {
  host: 'localhost', // where da selenium server at?
  port: 4444,

  baseUrl: 'http://localhost:4200',

  specs: [
    'tests/**/*.spec.js', // leave this in: this runs all tests
    //'tests/**/vwt-background.spec.js',
    //'test/**/predeploy-test-news-reviews.spec.js' // leave this out: this runs a particular test
    //'test/**/addons-not-present.spec.js' // leave this out: this runs a particular test
  ],

  capabilities: [{
    browserName: 'chrome'
  }],

  waitforTimeout: 60000,

  maxInstances: 1,

  sync: true,

  logLevel: 'silent',
  coloredLogs: true,
  mochaOpts: {
      timeout: 99999999
  },

  beforeTest: function (test) {
  },

  before: function() {

    global.testConfig = {};

    process.argv.forEach((arg) => {
      arg = arg.slice(2);
      var keyvalue = arg.split('=');
      global.testConfig.baseUrl = 'http://localhost:4200';
    })

    browser.timeouts('script', 60000);

    assert.include = function(str, includesThis, reason) {
      if(str.indexOf(includesThis) >= 0) {
        // we're good
      } else {
        console.log(reason, "\n\n" + str + " did not include " + includesThis);
      }
      assert(str.indexOf(includesThis) >= 0, reason);
    };
    browser.longTimeout = 60000;
    browser.timeouts('implicit', 5000);
    fs.readdir('./commands', (err, files) => {
      files.forEach(file => {
        file = file.replace('.js', '');
        var fn = require('./commands/' + file);
        browser.addCommand(file, fn);
      });
    })
  },
}
