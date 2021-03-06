const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const htmlPlugin = new HtmlWebpackPlugin({
    template: "./public/index.html",
    filename: "./index.html"
});

const CopyPlugin = require("copy-webpack-plugin");

module.exports = (_, argv) => {
    return {
        mode: argv.mode,
        entry: path.resolve(__dirname, './src/index.jsx'),
        optimization: {
            // We no not want to minimize our code.
            minimize: false
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(png|jpe?g|gif|json)$/i,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: 'svg-url-loader',
                            options: {
                                limit: 10000,
                            },
                        },
                    ],
                },
                // patching https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                },
                {
                    test: /\.json$/i,
                    loader: 'json5-loader',
                    type: 'javascript/auto',
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        resolve: {
            extensions: ['*', '.js', '.jsx'],
        },
        devtool: 'inline-source-map',
        plugins: [
            new CleanWebpackPlugin(),
            htmlPlugin,
            // copying needed files from public folder
            new CopyPlugin({
                patterns: [
                    { from: "./public/manifest.json", to: "./" },
                    { from: "./public/facet_logo_512x512.png", to: "./" },
                    { from: "./public/popup.html", to: "./" },
                    { from: "./public/authentication.html", to: "./" },
                    { from: "./public/welcome.html", to: "./" },
                    { from: "./public/background.js", to: "./" },
                    { from: "./public/mutationObserverVariableInjection.js", to: "./" },
                    { from: "./public/preview-click-content.js", to: "./" },
                    { from: "./public/facet-mutation-observer.js", to: "./" },
                ],
            }),
            // fix "process is not defined" error: https://stackoverflow.com/a/64553486/1373465
            new webpack.ProvidePlugin({
                process: 'process/browser',
            }),
        ],
        output: {
            publicPath: '',
            path: path.resolve(__dirname, './build'),
            filename: 'bundle.js',
        },
        devServer: {
            contentBase: path.resolve(__dirname, './build'),
            hot: true
        },
    };
}