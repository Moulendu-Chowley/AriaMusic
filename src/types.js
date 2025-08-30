export var SearchEngine;
(function (SearchEngine) {
    SearchEngine["YouTube"] = "ytsearch";
    SearchEngine["YouTubeMusic"] = "ytmsearch";
    SearchEngine["Spotify"] = "spsearch";
    SearchEngine["Deezer"] = "dzsearch";
    SearchEngine["Apple"] = "amsearch";
    SearchEngine["SoundCloud"] = "scsearch";
    SearchEngine["Yandex"] = "ymsearch";
    SearchEngine["JioSaavn"] = "jssearch";
})(SearchEngine || (SearchEngine = {}));

export var Language;
(function (Language) {
    Language["ChineseCN"] = "ChineseCN";
    Language["ChineseTW"] = "ChineseTW";
    Language["EnglishUS"] = "EnglishUS";
    Language["French"] = "French";
    Language["German"] = "German";
    Language["Hindi"] = "Hindi";
    Language["Indonesian"] = "Indonesian";
    Language["Japanese"] = "Japanese";
    Language["Korean"] = "Korean";
    Language["Norwegian"] = "Norwegian";
    Language["Polish"] = "Polish";
    Language["Russian"] = "Russian";
    Language["SpanishES"] = "SpanishES";
    Language["Turkish"] = "Turkish";
    Language["Vietnamese"] = "Vietnamese";
})(Language || (Language = {}));

export const LocaleFlags = {
    [Language.ChineseCN]: "🇨🇳",
    [Language.ChineseTW]: "🇹🇼",
    [Language.EnglishUS]: "🇺🇸",
    [Language.French]: "🇫🇷",
    [Language.German]: "🇩🇪",
    [Language.Hindi]: "🇮🇳",
    [Language.Indonesian]: "🇮🇩",
    [Language.Japanese]: "🇯🇵",
    [Language.Korean]: "🇰🇷",
    [Language.Norwegian]: "🇳🇴",
    [Language.Polish]: "🇵🇱",
    [Language.Russian]: "🇷🇺",
    [Language.SpanishES]: "🇪🇸",
    [Language.Turkish]: "🇹🇷",
    [Language.Vietnamese]: "🇻🇳",
};