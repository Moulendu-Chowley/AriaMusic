import signale from "signale";

const { Signale } = signale;

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

/**
 * Custom logger class that extends Signale.
 */
export default class Logger extends Signale {
    constructor() {
        super(options);
    }
}