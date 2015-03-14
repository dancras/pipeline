# Pipeline

A simple library to enhance your callback passing APIs (eg. Promises,
Subscribers) and encourage DRY code.

## Example

```js
var pipeline = require('pipeline');

function Example() {

    this.publish = function(value) {
        // ... Notify subscribers with value ...
    }

    this.subscribe = function(callback) {
        // ... Register callback as subscriber ...
    }

    // Add pipeline for 'subscribe' method
    pipeline(pipeline.pipes, ['subscribe'], this);
}

var example = new Example();

example
    .skipFalsy
    .withPrevious('foo')
    .subscribe(function() {
        console.log(arguments);
    });

example.publish('bar'); // Logs ['bar', 'foo']
example.publish(123);   // Logs [123, 'bar']
example.publish(null);  // Does nothing
```

## Adding your own pipes

Check how skipFalsy and withPrevious are defined in `src/pipeline.js`. The
first argument to `pipeline` is an object with your pipe definitions.
