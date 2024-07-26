import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import webpack from "webpack";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';
import { InjectManifest } from "workbox-webpack-plugin";
import { readFileSync } from "fs";
import { resolve as _resolve } from 'path';
import * as sass from "sass";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { DefinePlugin, HotModuleReplacementPlugin } = webpack;
const MiniCssExtractPluginLoader = MiniCssExtractPlugin.loader;


const allowedChars = /[^a-zA-Z0-9/-]/g;
function getRevision() {
    const rev = readFileSync('.git/HEAD').toString();
    if (rev.indexOf(':') === -1) {
        return rev;
    } else {
        return readFileSync('.git/' + rev.substring(5).replace(allowedChars, "")).toString()
            .replace(allowedChars, "");
    }
}

export default (env, argv) => {
    const production = argv.mode == "production";
    const environment = (env ? env.environment : null) || "local";
    const analyze = env && env.analyze;

    const base = {
        "gh-pages": "/",
        "local": "/"
    }[environment];

    const babelConfig = {
        presets: [
            [
                "@babel/preset-env",
                {
                    "useBuiltIns": "usage",
                    "corejs": "3.8"
                },
            ],
        ]
    };

    const cacheName = production ? getRevision() : "development";

    let scssRules = [
        { loader: "postcss-loader", options: {} },
        {
            loader: "sass-loader", options: {
                implementation: sass,
                sassOptions: {
                    includePaths: ["node_modules"],
                },
            }
        }
    ];

    let cssLoader = production ? MiniCssExtractPluginLoader : "style-loader";

    return {
        target: production ? "browserslist" : "web",
        entry: {
            index: './src/index.ts'
        },
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules(\/|\\)(\bwebpack\b|\bcore-js\b)/,
                    use: {
                        loader: 'babel-loader',
                        options: { ...babelConfig, sourceType: "unambiguous" },

                    },
                    resolve: {
                        fullySpecified: false
                    }
                },
                {
                    test: /\.tsx?$/,
                    use: [{
                        loader: 'babel-loader',
                        options: babelConfig,

                    },
                        "ts-loader"],
                    exclude: /node_modules/,
                },
                {
                    test: /\.html$/,
                    exclude: /index\.html$/,
                    use: [{
                        loader: "html-loader",
                        options: {
                            minimize: true
                        }
                    }]
                },
                {
                    test: /\.s[ac]ss$/i,
                    oneOf: [
                        {
                            assert: {
                                type: "css"
                            },
                            rules: [
                                {
                                    loader: "css-loader",
                                    options: {
                                        exportType: "string",
                                    }
                                },
                                ...scssRules
                            ]
                        }, {
                            use: [
                                cssLoader,
                                {
                                    loader: "css-loader", options: {

                                    }
                                },
                                ...scssRules
                            ]
                        }
                    ]
                },
                {
                    test: /\.wasm/,
                    type: "asset/resource"
                },
                {
                    test: /\.(svg)$/,
                    type: 'asset/source',
                    generator: {
                      filename: 'img/[hash][ext]'
                    }
                  }
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],

            fallback: {
                fs: false,
                path: false,
                crypto: false,
            },

        },
        output: {
            path: _resolve(__dirname, 'dist'),
            filename: '[contenthash].bundle.js',
            publicPath: base,
            globalObject: "self"
        },
        plugins: [
            new HtmlWebpackPlugin({
                base: base,
                title: "inkjet-printer",
                template: 'src/index.html'
            }),
            // new LicenseCheckerWebpackPlugin({
            //     outputFilename: "licenses.txt",
            //     allow: "(Apache-2.0 OR BSD-2-Clause OR BSD-3-Clause OR MIT OR ISC)"
            // }),
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css'
            }),
            new CleanWebpackPlugin(),
            new DefinePlugin({
                __ENVIRONMENT: `"${environment}"`,
                __CACHENAME: `"${cacheName}"`
            }),
            new CopyPlugin({
                patterns: [
                    { from: './favicons', to: 'favicons' },
                    { from: './src/site.webmanifest', to: './' },
                ],
            }),
            new InjectManifest({
                swSrc: "./src/sw.ts"
            }),
            ...(analyze ? [new BundleAnalyzerPlugin()] : []),
            new HotModuleReplacementPlugin()
        ],
        optimization: {
            splitChunks: {
                chunks: "all",
            },
        },
        mode: "development",
        devServer: {
            compress: true,
            port: 9000,
            historyApiFallback: {
                index: "/"
            },
            client: {
                overlay: {
                    warnings: false,
                    errors: true
                }
            },
            hot: true
        }
    };
}