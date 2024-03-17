/** @type {import("prettier").Config} */
module.exports = {
    endOfLine: "lf",
    quoteProps: "as-needed",
    semi: true,
    arrowParens: "always",
    singleQuote: false,
    trailingComma: "all",
    tabWidth: 4,
    useTabs: false,
    printWidth: 120,
    overrides: [
        {
            files: "*.yml",
            options: {
                tabWidth: 2,
                useTabs: false,
            },
        },
        {
            files: "*.json",
            options: {
                parser: "json",
                trailingComma: "none",
            },
        },
    ],
};
