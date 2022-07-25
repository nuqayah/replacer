module.exports = {
    content: ['./src/**/*.svelte', './node_modules/components/src/*.svelte'],
    corePlugins: {
        container: false,
    },
    plugins: [require('tailwindcss-rtl')],
};
