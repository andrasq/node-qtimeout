/**
 * qtimeout - fast restartable nodejs timer
 *
 * efficient resettable timer.  Uses native uv timers if available, else setTimeout.
 *
 * Copyright (C) 2016 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var useNativeTimer = false;
try {
    // throws 'No such module: timer_wrap' if no timer_wrap
    var TimerWrap = process.binding('timer_wrap').Timer;
    var testTimer = new TimerWrap();
    useNativeTimer = (testTimer && testTimer.start && testTimer.stop && testTimer.unref);
}
catch (err) {
    console.log("timer_wrap not available, using TimeoutTimer");
    useNativeTimer = false;
}

var Timer;
module.exports = Timer = useNativeTimer ? NativeTimer : TimeoutTimer;
module.exports.Timer = Timer;
module.exports.NativeTimer = NativeTimer;
module.exports.TimeoutTimer = TimeoutTimer;

function TimeoutTimer( callback ) {
    if (typeof callback !== 'function') throw new Error("TimeoutTimer needs a callback");

    var self = this;
    this.running = false;
    this.callback = function() { self.running = false; callback() };
    this._unref = false;
    this.timer = null;
}

TimeoutTimer.prototype.start = function timer_start( timeout ) {
    if (timeout > 0) {
        if (this.running) clearTimeout(this.timer);
        this.timer = setTimeout(this.callback, timeout);
        if (this._unref) this.timer.unref();
        this.running = true;
    }
    else this.stop();
    return this;
}

TimeoutTimer.prototype.stop = function timer_stop( ) {
    if (this.running) clearTimeout(this.timer);
    this.running = false;
    return this;
}

TimeoutTimer.prototype.ref = function timer_ref( ) {
    this._unref = false;
    return this;
}

TimeoutTimer.prototype.unref = function timer_unref( ) {
    this._unref = true;
    return this;
}

TimeoutTimer.prototype = TimeoutTimer.prototype;


function NativeTimer( callback ) {
    if (typeof callback !== 'function') throw new Error("NativeTimer needs a callback");

    var self = this;
    this.running = false;
    this.callback = function() { self.running = false; callback() };
    this.timer = new TimerWrap();
    this.timer.ontimeout = this.callback;       // if (process.version < 'v0.11.')
    this.timer[0] = this.callback;
}

NativeTimer.prototype.start = function timer_start( timeout ) {
    if (timeout > 0) {
        this.timer.start(timeout | 0);
        this.running = true;
    }
    else this.stop();
    return this;
}

NativeTimer.prototype.stop = function timer_stop( ) {
    this.timer.stop();
    this.running = false;
    return this;
}

NativeTimer.prototype.ref = function timer_ref( ) {
    this.timer.ref();
    return this;
}

NativeTimer.prototype.unref = function timer_unref( ) {
    this.timer.unref();
    return this;
}

NativeTimer.prototype = NativeTimer.prototype;


/** quicktest:

var ncalls = 0;
var n = new Timer(function(){
    ncalls += 1;
console.log("AR: ncalls %d", ncalls);
    if (ncalls == 3) {
        console.log("AR: done");
        //process.exit();
    }
});
console.log(n);
n.start(10000);
n.start(200);
n.ref();
console.log(n);

/**/
