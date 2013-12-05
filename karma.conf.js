// Karma configuration
// Generated on Mon Sep 16 2013 21:23:04 GMT-0700 (PDT)
//

module.exports = function(config) {
  var settings = {};

  settings.files=[
    'node_modules/closure-library/closure/goog/base.js',
    'javascript/test/**/*.js',
    'javascript/test_support/**/*.html',
    'javascript/test_support/**/*.js',
    {pattern: 'javascript/src/**/*.js', included: false},
    {pattern: 'node_modules/closure-library/closure/goog/deps.js', included: false, served: false}
  ];

  // base path, that will be used to resolve files and exclude
  settings.basePath = '';

  // frameworks to use
  settings.frameworks = ['jasmine', 'sinon', 'closure'];

  settings.preprocessors = {
    'javascript/test_support/**/*.html': ['html2js'],
    'javascript/test_support/**/*.js': ['html2js'],
    'javascript/test/*.js': ['closure', 'closure-iit'],
    'javascript/src/**/*.js': ['closure'],
    'node_modules/closure-library/closure/goog/deps.js': ['closure-deps']
  };

  // list of files to exclude
  settings.exclude = [ '**/*.sw?' ];

  // test results reporter to use
  // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
  settings.reporters = ['progress'];

  // web server port
  settings.port = 9876;

  // enable / disable colors in the output (reporters and logs)
  settings.colors = true;

  // level of logging
  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
  settings.logLevel = config.LOG_INFO;

  // enable / disable watching file and executing tests whenever any file changes
  settings.autoWatch = true;

  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera
  // - Safari (only Mac)
  // - PhantomJS
  // - IE (only Windows)
  settings.browsers = ['PhantomJS'];

  if(process.env.KARMA_BROWSER){
    settings.browsers.push(process.env.KARMA_BROWSER)
  }

  // If browser does not capture in given timeout [ms], kill it
  settings.captureTimeout = 60000;

  // Continuous Integration mode
  // if true, it capture browsers, run tests and exit
  settings.singleRun = false;

  if(process.env.COVERAGE){
     process.stdout.write("COVERAGE is set - instrumenting and only running once\n\n");
     settings.singleRun = true;
     settings.reporters = ['coverage', 'progress'];
     settings.preprocessors['javascript/**/*.js'] = ['coverage'];
    //alter settings to handle coverage
  }
  config.set(settings);
};
