"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const signale_1 = tslib_1.__importDefault(require("signale"));
const { Signale } = signale_1.default;
const options = {
    disabled: false,
    interactive: false,
    logLevel: "info",
    scope: "Aria music",
    types: {
        info: {
            badge: "ℹ",
            color: "blue",
            label: "info",
        },
        warn: {
            badge: "⚠",
            color: "yellow",
            label: "warn",
        },
        error: {
            badge: "✖",
            color: "red",
            label: "error",
        },
        debug: {
            badge: "🐛",
            color: "magenta",
            label: "debug",
        },
        success: {
            badge: "✔",
            color: "green",
            label: "success",
        },
        log: {
            badge: "📝",
            color: "white",
            label: "log",
        },
        pause: {
            badge: "⏸",
            color: "yellow",
            label: "pause",
        },
        start: {
            badge: "▶",
            color: "green",
            label: "start",
        },
    },
};
class Logger extends Signale {
    constructor() {
        super(options);
    }
}
exports.default = Logger;
