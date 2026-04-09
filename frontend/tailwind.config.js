/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sphere: {
          primary: {
            100: '#caf0f8',
            200: '#ade8f4',
            300: '#90e0ef',
            400: '#48cae4',
            500: '#00b4d8',
            600: '#0096c7',
            700: '#0077b6',
            800: '#023e8a',
            900: '#03045e',
          },
          grey: {
            0: '#FFFFFF',
            100: '#F9FAFB',
            200: '#F4F6F8',
            300: '#DFE3E8',
            400: '#C4CDD5',
            500: '#919EAB',
            600: '#637381',
            700: '#454F5B',
            800: '#212B36',
            900: '#161C24',
          },
        },
      },
    },
  },
  plugins: [],
}

