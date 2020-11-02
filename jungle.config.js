const svelte = require('rollup-plugin-svelte');
const { terser } = require('rollup-plugin-terser');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const ssr = require('rollup-plugin-svelte-ssr');

//bring in fetch
const fetch = require('node-fetch');
//bring in sanity client
const sanityClient = require('@sanity/client');
// declare sanity client
const client = sanityClient({
    projectId: 'o5s3bw3e',
    dataset: 'production',
    token: '', // or leave blank to be anonymous user
    useCdn: true // `false` if you want to ensure fresh data
});

const { junglePreprocess } = require('junglejs');

const production = !!process.env.PRODUCTION;

const fs = require('fs');
const templateHtml = fs.readFileSync('src/template.html', { encoding: 'utf8', flag: 'r' });

module.exports = async () => {
    //fetch our data
    const sanityPost = await client.fetch("*[_type == 'post']");
    // console.log(sanityPost);
    //return everything else within the module
    return{
    clientInputOptions: (filename, extension) => {
        return {
            input: `jungle/build${extension}/${filename}/main.js`,
            plugins: [
                svelte({
                    dev: !production,
                    hydratable: true,
                    preprocess: [
                        junglePreprocess,
                    ],
                }),

                resolve({
                    browser: true,
                    dedupe: ["svelte"],
                }),
                commonjs(),

                production && terser(),
            ],
        }
    },
    clientOutputOptions: (filename, extension) => {
        return {
            sourcemap: /*!production ? 'inline' : */false,
            format: 'iife',
            name: "app",
            file: `jungle/build${extension}/${filename}/bundle.js`,
        };
    },
    ssrInputOptions: (filename, extension) => {
        const processedFilename = filename == "." ? "Index" : filename.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

        return {
            input: `src/routes${extension}/${processedFilename}.svelte`,
            plugins: [
                svelte({
                    dev: !production,
                    preprocess: [
                        junglePreprocess,
                    ],
                    generate: "ssr",
                    hydratable: true,
                    css: (css) => {
                        css.write(`jungle/build${extension}/${filename}/bundle.css`);
                    },
                }),

                resolve({
                    browser: true,
                    dedupe: ["svelte"],
                }),
                commonjs(),

                production && terser(),

                ssr({
                    fileName: 'index.html',
                    configureExport: function (html, css) {
                        return templateHtml.replace('{jungle.export.html}', html);
                    },
                }),
            ],
        }
    },
    ssrOutputOptions: (filename, extension) => {
        return {
            sourcemap: !production ? 'inline' : false,
            format: 'cjs',
            file: `jungle/build${extension}/${filename}/ssr.js`,
        }
    },
    dataSources: [
        {
            format: "json", name: "post", items: sanityPost, queryArgs: { slug: 'String!' }
        }
    ]
    };
};
