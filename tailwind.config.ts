import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds & Surfaces
        background: '#FAFAF8',
        surface: '#F5F3EF',
        border: '#E8E4DD',
        sand: '#E8E4DD',

        // Text colors
        charcoal: '#1F1F1F',
        stone: '#6B6B6B',
        pebble: '#9CA3A0',

        // Accent colors
        forest: {
          DEFAULT: '#2D5A45',
          dark: '#1E3D2F',
          light: '#2D5A451A',
        },
        sage: {
          DEFAULT: '#4A7C59',
          light: '#4A7C591A',
        },
        amber: {
          DEFAULT: '#C4841D',
          light: '#C4841D1A',
        },
        terracotta: {
          DEFAULT: '#B54A32',
          light: '#B54A321A',
        },
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.04)',
        'md': '0 4px 12px rgba(0,0,0,0.06)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

