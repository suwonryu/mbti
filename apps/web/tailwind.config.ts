import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        accent: '#ff6a3d',
        highlight: '#5ec2b7',
      },
    },
  },
  plugins: [],
};

export default config;
