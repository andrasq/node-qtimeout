'use strict';

var qtimeit = require('qtimeit');
var qtimeout = require('./');

var x;

var ncalls = 0;
function callback(){ ncalls += 1 };

//qtimeit(100000, function(){ x = new qtimeout(callback); });
// 1.1m/s

//qtimeit(100000, function(){ x = new qtimeout(callback); x.unref() });
// 1.3m/s

//qtimeit(100000, function(){ x = setTimeout(callback, 2); });
// 5.3m/s, 4.4m/s alone

// pre-create the timer_wrap object:
//setTimeout(callback, 2)
//qtimeit(100000, function(){ x = setTimeout(callback, 2); clearTimeout(x); });
// 736k/s if have to create a timer_wrap object too (2.7m/s if queueing a timeout on an existing wrap)

var t = new qtimeout(callback);
//qtimeit(100000, function(){ t.start(100) });
// 37m/s (26m/s if it tests first)

//qtimeit(100000, function(){ t.stop() });
// 67m/s if stops it each time (460m/s if it tests first)

qtimeit(100000, function(){ t.start(100); t.stop() })
// 25m/s

var t = new qtimeout(callback);
//qtimeit(100000, function(){ t.timer.start(100) });
// 39m/s
//qtimeit(100000, function(){ t.timer.stop() });
// 74m/s
//qtimeit(100000, function(){ t.timer.start(100); t.timer.stop() });
// 27m/s
