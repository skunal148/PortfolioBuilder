// craco.config.js
const path = require('node_modules/tailwindcss'); // Import the 'path' module

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};