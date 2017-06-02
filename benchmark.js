'use strict';

var qtimeit = require('qtimeit');
var qtimeout = require('./');

var x;

setTimeout(function() {

    var ncalls = 0;
    function callback(){ ncalls += 1 };

    //qtimeit(100000, function(){ x = new qtimeout(callback); });
    // 1.1m/s

    //qtimeit(100000, function(){ x = new qtimeout(callback); x.unref() });
    // 1.3m/s

    var t = setTimeout(callback, 100);
    qtimeit(100000, function(){ t.ref(); t.unref() });
    // 29m/s

    //qtimeit(100000, function(){ x = setTimeout(callback, 2); });
    // 5.3m/s, 4.4m/s alone

    // pre-create the timer_wrap object:
    //setTimeout(callback, 2)
    //qtimeit(100000, function(){ x = setTimeout(callback, 2); clearTimeout(x); });
    // 736k/s if have to create a timer_wrap object too (2.7m/s if queueing a timeout on an existing wrap)

    var t = new qtimeout(callback);
    //qtimeit(100000, function(){ t.start(100) });
    // 37m/s (26m/s if it tests first)
    // 34m/s

    var v = 1;
    //qtimeit(100000, function(){ t.start(v++); t.stop() });
    // 24m/s different timeouts (uv heap mgmt?)

    //qtimeit(100000, function(){ t.stop() });
    // 67m/s if stops it each time (460m/s if it tests first)

    //qtimeit(100000, function(){ t.start(100); t.stop() })
    // 24m/s
    //qtimeit(100000, function(){ t.ref(); t.unref() });
    // 39m/s
    // 37m/s

    var t = new qtimeout(callback);
    //qtimeit(100000, function(){ t.timer.start(100) });
    // 39m/s
    //qtimeit(100000, function(){ t.timer.stop() });
    // 74m/s
    //qtimeit(100000, function(){ t.timer.start(100); t.timer.stop() });
    // 27m/s

});
