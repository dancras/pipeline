module.exports = function(pipes, methods, subject) {

    subject._pipes = [];

    Object.keys(pipes).forEach(function(key) {

        var pipeFn = pipes[key];

        if (pipeFn.length > 1) {

            subject[key] = function() {

                var boundPipeFn = Function.bind.apply(
                    pipeFn,
                    [null].concat(Array.prototype.slice.call(arguments))
                );

                return Object.create(this, {
                    _pipes: {
                        value: [boundPipeFn].concat(this._pipes)
                    }
                });

            };

        } else {

            Object.defineProperty(subject, key, {
                get: function() {
                    return Object.create(this, {
                        _pipes: {
                            value: [pipeFn].concat(this._pipes)
                        }
                    });
                }
            });

        }

    });

    methods.forEach(function(methodName) {

        var originalFn = subject[methodName];

        subject[methodName] = function(originalCallback) {

            return originalFn.call(
                subject,
                this._pipes.reduce(function(memoCallback, pipeFn) {
                    return pipeFn(memoCallback);
                }, originalCallback)
            );
        };

    });

};

module.exports.pipes = {

    skipFalsy: function(next) {

        return function() {

            if (!arguments[0]) {
                return arguments[0];
            }

            return next.apply(this, arguments);

        };

    },

    withPrevious: function(previous, next) {

        return function(current) {
            var oldPrevious = previous;
            previous = current;
            next(current, oldPrevious);
        };
    }

};