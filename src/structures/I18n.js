import i18n from "i18n";
import { Locale } from "discord.js";
import config from "../config.js";
import { Language } from "../types.js";
import Logger from "./Logger.js";

const log = new Logger();

/**
 * Initializes i18n.
 */
export function initI18n() {
    i18n.configure({
        locales: Object.keys(Language),
        defaultLocale: typeof config === "string" ? config : "EnglishUS",
        directory: `${process.cwd()}/locales`,
        retryInDefaultLocale: true,
        objectNotation: true,
        register: global,
        logWarnFn: console.warn,
        logErrorFn: console.error,
        missingKeyFn: (_locale, value) => {
            return value;
        },
        mustacheConfig: {
            tags: ["{", "}"],
            disable: false,
        },
    });
    log.info("I18n has been initialized");
}

/**
 * Gets a localized string.
 * @param {string} locale The locale to use.
 * @param {string} text The key of the string.
 * @param {...any} params The parameters for the string.
 * @returns {string}
 */
export function T(locale, text, ...params) {
    i18n.setLocale(locale);
    return i18n.__mf(text, ...params);
}

/**
 * Creates a localization object.
 * @param {Locale} lan The locale to use.
 * @param {string} name The name of the string.
 * @param {string} desc The description of the string.
 * @returns {{name: [Locale, string], description: [Locale, string]}}
 */
export function localization(lan, name, desc) {
    return {
        name: [lan, name],
        description: [lan, T(lan, desc)],
    };
}

/**
 * Creates a description localization object.
 * @param {string} name The name of the string.
 * @param {string} text The text of the string.
 * @returns {{name: [Locale, string], description: [Locale, string]}[]}
 */
export function descriptionLocalization(name, text) {
    return i18n.getLocales().map((locale) => {
        if (locale in Locale) {
            const localeValue = Locale[locale];
            return localization(localeValue, name, text);
        }
        return localization(locale, name, text);
    });
}

export { i18n };