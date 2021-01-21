const postcss = require('rollup-plugin-postcss');
const cssnano = require('cssnano');
module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          cssnano({
            preset: 'default',
          }),
        ],
        inject: true,
        // only write out CSS for the first bundle (avoids pointless extra files):
        extract: false,
        less: true,
      })
    );

    return config;
  },
};
