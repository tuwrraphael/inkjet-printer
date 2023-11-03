const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin, webpack, HotModuleReplacementPlugin } = require("webpack");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const LicenseCheckerWebpackPlugin = require("license-checker-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const fs = require("fs");
const path = require('path');


const allowedChars = /[^a-zA-Z0-9/]|-/g;
function getRevision() {
    const rev = fs.readFileSync('.git/HEAD').toString();
    if (rev.indexOf(':') === -1) {
        return rev;
    } else {
        return fs.readFileSync('.git/' + rev.substring(5).replace(allowedChars, "")).toString()
            .replace(allowedChars, "");
    }
}

module.exports = (env, argv) => {
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
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader", options: {

                            }
                        },
                        { loader: "postcss-loader", options: {} },
                        {
                            loader: "sass-loader", options: {
                                implementation: require('sass'),
                                sassOptions: {
                                    includePaths: ["node_modules"],
                                },
                            }
                        }
                    ]
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[contenthash].bundle.js',
            publicPath: base,
            globalObject: "self"
        },
        plugins: [
            new HtmlWebpackPlugin({
                base: base, title: "dropwatcher",
                template: 'src/index.html'
            }),
            new LicenseCheckerWebpackPlugin({
                outputFilename: "licenses.txt",
                allow: "(Apache-2.0 OR BSD-2-Clause OR BSD-3-Clause OR MIT OR ISC)"
            }),
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
            hot:true
        }
    };
}