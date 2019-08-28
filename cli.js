#!/usr/bin/env node
'use strict';
const meow = require('meow');
const purify = require('purify-css');
const fs = require('fs');

const cli = meow(
  `
	Usage
	  $ shopify-css-cleaner <Shopify theme directory> <CSS file> [Options]

	Options
	  --min, -m        Minify CSS        [boolean]        [Default: false]

	Examples
	  $ shopify-css-cleaner ~/Projects/my-shopify-store styles.css
	  styles.theme.clean.css, styles.index.clean.css, styles.product.clean.css, etc.
`,
  {
    flags: {
      minify: {
        type: 'boolean',
        default: 'false',
        alias: 'm',
      },
    },
  },
);

if (cli.input.length < 2) cli.showHelp();

const mainDir = cli.input[0];
const cssFile = cli.input[1];
const minify = cli.flags.minify;
const templateDir = `${mainDir}/templates`;
const snippetDir = `${mainDir}/snippets`;
const layoutDir = `${mainDir}/layout`;
const sectionsDir = `${mainDir}/sections`;
const assetDir = `${mainDir}/assets`;

const clean = (cssFile, templateDir, assetDir) => {
  fs.readdir(templateDir, { withFileTypes: true }, (err, files) => {
    if (err) console.log(`Error reading directory: ${templateDir}`, err);

    files.forEach(file => {
      if (file.isDirectory()) {
        clean(cssFile, `${templateDir}/${file.name}`, assetDir);
      } else {
        const content = [`${templateDir}/${file.name}`];
        const css = [`${assetDir}/${cssFile}`];
        const options = {
          minify,
          info: true,
          output: `${assetDir}/${cssFile.substring(
            0,
            cssFile.length - 4,
          )}.${file.name.substring(0, file.name.length - 7)}.purified.css`,
        };

        purify(content, css, options, () => {
          console.log(`Cleaned ${file.name}`);
        });
      }
    });
  });
};
try {
  clean(cssFile, templateDir, assetDir);
  clean(cssFile, snippetDir, assetDir);
  clean(cssFile, layoutDir, assetDir);
  clean(cssFile, sectionsDir, assetDir);
} catch (error) {
  console.log(
    'Error cleaning your files. Make sure you are running this at the root of your Shopify theme.',
  );
}
