const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const { provideSAOTailwindBoxShadow, provideSAOTailwindColors, provideSAOTailwindBackgroundImages } = require('@sao-palette/core/tailwind');
const { provideSAOTailwindTypography } = require('@sao-typography/core/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{problem-2,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    colors: {
      ...provideSAOTailwindColors(),
    },
    backgroundImage: {
      ...provideSAOTailwindBackgroundImages(),
    },
    boxShadow: {
      ...provideSAOTailwindBoxShadow(),
    },
    fontSize: {
      ...provideSAOTailwindTypography(),
    },
  },
};
