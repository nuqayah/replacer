import {fontFamily} from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

function spacing({matchUtilities, addUtilities, theme}) {
    matchUtilities(
        {
            'space-s': (value) => ({
                '> :not([hidden]) ~ :not([hidden])': {
                    '--tw-space-s-reverse': '0',
                    marginInlineEnd: `calc(${value} * var(--tw-space-s-reverse))`,
                    marginInlineStart: `calc(${value} * calc(1 - var(--tw-space-s-reverse)))`,
                },
            }),
        },
        {
            supportsNegativeValues: true,
            values: theme('space'),
        }
    )
    addUtilities({
        '.space-s-reverse > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-s-reverse': '1',
        },
    })
}

/** @type {import('tailwindcss').Config} */
const config = {
    content: ['./index.html', './src/**/*.svelte', './node_modules/components/src/*.svelte'],

    experimental: {
        optimizeUniversalDefaults: true,
    },
    corePlugins: {
        container: false,
    },
    theme: {
        extend: {
            fontFamily: {
                sans: ['Kitab', ...fontFamily.sans],
            },
            listStyleType: {
                arabic: 'arabic-indic',
            },
        },
    },
    plugins: [plugin(helpers => spacing(helpers))],
}
export default config
