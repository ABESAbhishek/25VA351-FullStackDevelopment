const EventEmitter = require('events');

const emitter = new EventEmitter();

// Event listeners
emitter.on('greet', (name) => {
    console.log("Hello, " + name);
});

emitter.on('exit', () => {
    console.log("Goodbye!");
});

// Trigger events
emitter.emit('greet', 'Abhishek');
emitter.emit('exit');

// Event Loop Demo
console.log("Start");

process.nextTick(() => {
    console.log("process.nextTick");
});

setTimeout(() => {
    console.log("setTimeout");
}, 0);

setImmediate(() => {
    console.log("setImmediate");
});

console.log("End");