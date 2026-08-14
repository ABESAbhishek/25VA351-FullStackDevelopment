import { emit } from "node:cluster";
import { EventEmitter } from "node:events";

function myFunction() {
    const myEmitter = new EventEmitter();

    return {
        addEventListener(eventType, listener) {
            myEmitter.on(eventType, listener);
        },

        removeEventListener(eventType, listener) {
            myEmitter.off(eventType, listener);
        },

        dispatchEvent(event) {
            event.target = this;
            event.currentTarget = this;
            myEmitter.emit(event.eventType, event);
        }
    };
}

// Create button
const button = myFunction();
const button = createDomElement();

button.addEventListener("submit", (event) => {
    console.log("Submit event fired!");
    console.log(event.detail);
});

button.dispatchEvent({
    eventType: "submit",
    detail: "Button submitted"
});

// Add event listener
button.addEventListener("save", (event) => {
    console.log("Saving...");
    console.log(event.detail);
});

// Dispatch event
button.dispatchEvent({
    eventType: "save",
    detail: "This is save dispatched"
});
function createDomElements()
{
    const emitter = new EventEmitter();
    return {
        addEventListener(eventType, listener) {
            emitter.on(eventType, listener);
        },
        removeEventListener(eventType, listener) {
            emitter.off(eventType, listener);
        },
        dispatchEvent(event) {
            event.target = this;
            event.currentTarget = this;
            emitter.emit(event.eventType, event);
        }
    };
}