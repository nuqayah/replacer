module.exports = {
    content: ['./src/**/*.svelte', './node_modules/components/src/*.svelte'],

    corePlugins: {
        container: false,
    },
    theme: {
        extend: {
            fontFamily: {
                sans: ['Kitab', ...require('tailwindcss/defaultTheme.js').fontFamily.sans],
            },
        },
    },
    plugins: [require('tailwindcss-rtl')],
};
