"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = void 0;
exports.initI18n = initI18n;
exports.T = T;
exports.localization = localization;
exports.descriptionLocalization = descriptionLocalization;
const tslib_1 = require("tslib");
const i18n_1 = tslib_1.__importDefault(require("i18n"));
exports.i18n = i18n_1.default;
const discord_js_1 = require("discord.js");
const config_1 = tslib_1.__importDefault(require("../config"));
const types_1 = require("../types");
const Logger_1 = tslib_1.__importDefault(require("./Logger"));
const log = new Logger_1.default();
function initI18n() {
    i18n_1.default.configure({
        locales: Object.keys(types_1.Language),
        defaultLocale: typeof config_1.default === "string" ? config_1.default : "EnglishUS",
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
function T(locale, text, ...params) {
    i18n_1.default.setLocale(locale);
    return i18n_1.default.__mf(text, ...params);
}
function localization(lan, name, desc) {
    return {
        name: [discord_js_1.Locale[lan], name],
        description: [discord_js_1.Locale[lan], T(lan, desc)],
    };
}
function descriptionLocalization(name, text) {
    return i18n_1.default.getLocales().map((locale) => {
        if (locale in discord_js_1.Locale) {
            const localeValue = discord_js_1.Locale[locale];
            return localization(localeValue, name, text);
        }
        return localization(locale, name, text);
    });
}
