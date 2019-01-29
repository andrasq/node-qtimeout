qtimeout
========
[![Build Status](https://api.travis-ci.org/andrasq/node-qtimeout.svg?branch=master)](https://travis-ci.org/andrasq/node-qtimeout?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/andrasq/node-qtimeout/badge.svg?branch=master)](https://coveralls.io/github/andrasq/node-qtimeout?branch=master)

Fast restartable nodejs timer.

For watchdog type timeouts that repeatedly cancel the trigger timer and restart
with a new expiration time, it is much more efficient to restart an exiting timer
than to cancel the timeout and set a new one.

If it can, qtimeout uses a native nodejs `timer_wrap` binding (a `uv` timer).

Summary

    QTimeout = require('qtimeout');
    var t1 = Date.now();

    // invoke callback after 10 ms
    timer1 = new QTimeout(callback).start(10);

    // changed our mind, invoke it after 20 ms
    timer1.start(20);

    function callback() {
        var t2 = Date.now();
        console.log("callback called after %d ms", t2 - t1);
    }

Benchmark:

    setTimeout / clearTimeout   0.74 m / s      # new timer_wrap
    setTimeout / clearTimeout   2.7 m / s       # existing timer_wrap

    new QTimeout                1.1 m / s       # reusable timeout
    qtimeout start / stop       25 m / s        # reuse timeout
        .start                  37 m / s
        .stop                   67 m / s

Api
---


### new QTimeout( callback )

Create a timeout object that will invoke the callback.  The timout is referenced
but not active (the trigger timer is not running).

### start( ms )

Arrange for the timeout to trigger and call its callback after `ms` milliseconds.
Starting an already active timeout will cause its timer to be reset for ms
milliseconds from now; it will not trigger at the old timeout time.

### stop( )

De-activate the timer by stopping the timer.  This cancels its trigger, so the
callback will not be called.  Stopping an inactive timeout has no effect.

### unref( )

By default, nodejs will not exit while a timeout is active.  `Unref` removes this
restriction from the timeout object so the timeout can be activated (started)
without blocking program exit.  Unref-ing an unref-d timeout has no effect.

### ref( )

Undo an `unref`, make the program wait for this object's timeout to trigger before
exiting.  The program can exit once the timeout triggers or the timeout object is
`unref`-d.  Ref-ing a ref-d timeout has no effect.

### running

The `running` property is `true` if the timeout was started, `false` if stopped.
This is a read-only property; do not change.


Bugs
----

- a timeout can trigger up to 1 ms early, as if the internal timer counted
  elapsed millisecond boundaries, not true elapsed time
- when nodejs is starting the uv timers may not track the elapsed time until node
  has finished initializing.  A timeout started during the startup may trigger too
  soon by approximately 3/4 of the nodejs startup time (`$ time nodejs -p 1`).


Change Log
----------

- 0.9.4 - fix factory-style constructor call
- 0.9.3 - ci testing, 100% unit test coverage, coverage buttons
- 0.9.2 - readme edits, more benchmarks, fix package.json
- 0.9.0 - first version, brought over from [`qlimiter`](https://npmjs.org/package/qlimiter)
