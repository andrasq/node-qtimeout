qtimeout
========

Fast restartable nodejs timer.

For watchdog type timeouts that repeatedly cancel the trigger timer and restart
with a new expiration time, it is much more efficient to restart an exiting timer
than to cancel the timeout and set a new one.

If it can, qtimeout uses a native nodejs `timer_wrap` binding (a `uv` timer).

Summary

    QTimeout = require('qtimeout');

    // invoke callback after 10 ms
    timer1 = new QTimeout(callback).start(10);

    // changed our mind, invoke it after 20 ms
    timer1.start(20);

Benchmark:

    setTimeout / clearTimeout   0.74 m / s      # new timer_wrap
    setTimeout / clearTimeout   2.7 m / s       # existing timer_wrap

    new QTimeout                1.1 m / s       # reusable timeout
    qtimeout start / stop       25 m / s        # reuse timeout
        .start                  37 m / s
        .stop                   67 m / s

Api
---


### new QTimeout( function )

Create a timeout object that will invoke the function.  The timout is referenced
but not active (the trigger timer is not running).

### start( ms )

Arrange for the timeout to trigger and call its function after `ms` milliseconds.
Starting an already active timeout will cause its timer to be reset for ms
milliseconds from now; it will not trigger at the old timeout time.

### stop( )

De-activate the timer by stopping the timer.  This cancels its trigger, so the
callback function will not be called.  Stopping an inactive timeout has no effect.

### unref( )

By default, a timeout object prevents the program from exiting.  `Unref` removes
this restriction for the object.  Unref-ing an unref-d timeout has no effect.

### ref( )

Undo an `unref`, make the program wait for the timeout object to be unref-d before
exiting.  Ref-ing a ref-d timeout has no effect.

### running

The `running` property is `true` if the timeout was started, `false` if stopped.
This is a read-only property; do not set.


Change Log
----------

- 0.9.0 - first version, brought over from [`qlimiter`](https://npmjs.org/package/qlimiter)
