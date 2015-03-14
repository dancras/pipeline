var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    pipeline = require('../src/pipeline');

chai.should();
chai.use(sinonChai);

describe('Pipeline', function() {

    var subject,
        originalCallback;

    beforeEach(function() {

        subject = {
            subscribe: function(callback) {
                this.callback = callback;
            }
        };

        originalCallback = sinon.spy();

    });

    describe('Core', function() {

        var pipes;

        beforeEach(function() {

            pipes = {
                intercept: function(next) {
                    return function(arg) {
                        return next(arg + arg);
                    };
                }
            };

        });

        it('should be possible to intercept a callback', function() {

            pipeline(pipes, ['subscribe'], subject);

            subject.intercept.subscribe(originalCallback);
            subject.callback('foo');

            originalCallback.should.have.been.calledWith('foofoo');

        });

        it('should be possible to chain intercepts', function() {

            pipeline(pipes, ['subscribe'], subject);

            subject.intercept.intercept.subscribe(originalCallback);
            subject.callback('foo');

            originalCallback.should.have.been.calledWith('foofoofoofoo');

        });

        it('should not affect future calls without intercepts', function() {

            pipeline(pipes, ['subscribe'], subject);

            subject.intercept.subscribe(function() {});
            subject.callback('foo');

            subject.subscribe(originalCallback);
            subject.callback('foo');

            originalCallback.should.have.been.calledWith('foo');

        });

    });

    describe('Pipes', function() {

        describe('skipFalsy', function() {

            it('should break the pipeline when falsy', function() {

                pipeline(pipeline.pipes, ['subscribe'], subject);

                subject.skipFalsy.subscribe(originalCallback);
                subject.callback(null);

                originalCallback.should.not.have.been.called;

            });

            it('should pass the args through when not falsy', function() {

                pipeline(pipeline.pipes, ['subscribe'], subject);

                subject.skipFalsy.subscribe(originalCallback);
                subject.callback('foo');

                originalCallback.should.have.been.calledWith('foo');

            });

        });

        describe('withPrevious', function() {

            it('should pass the previous value as the second arg', function() {

                pipeline(pipeline.pipes, ['subscribe'], subject);

                subject.withPrevious(null).subscribe(originalCallback);

                subject.callback('foo');
                subject.callback('bar');

                originalCallback.should.have.been.calledWith('bar', 'foo');

            });

            it('should default the previous value to the provided value', function() {

                pipeline(pipeline.pipes, ['subscribe'], subject);

                subject.withPrevious(123).subscribe(originalCallback);

                subject.callback('foo');

                originalCallback.should.have.been.calledWith('foo', 123);

            });

        });

    });

});