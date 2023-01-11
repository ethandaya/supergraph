module.exports = {
    root: true,
    // This tells ESLint to load the config from the package `eslint-config-heaps`
    extends: ["heaps"],
    settings: {
        next: {
            rootDir: ["apps/*/"],
        },
    },
};