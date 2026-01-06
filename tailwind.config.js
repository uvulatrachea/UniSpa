import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.jsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        unispa: {
          primary: '#7C3AED', // Softer purple
          primaryLight: '#8B5CF6',
          primaryDark: '#5B21B6',
          accent: '#F59E0B', // Softer amber
          surface: '#FFFFFF',
          surfaceAlt: '#F8FAFC',
          muted: '#EDE9FE',
          ink: '#1E293B',
          subtle: '#94A3B8',
        },
      },
    },
  },
  plugins: [forms],
};