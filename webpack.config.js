const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPugPlugin = require("html-webpack-pug-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const SRC = "src";
const isProd = process.env.NODE_ENV === "production";
var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
var server_host = process.env.YOUR_HOST || "0.0.0.0" ;

/* Dynamically add pug files */

const pugs = [];
const files = fs.readdirSync(path.resolve(__dirname, SRC));

const decideFileStructure = filename =>
  filename === "index" ? filename : `${filename}/index`;

files.forEach(file => {
  if (file.match(/\.pug$/)) {
    let filename = file.substring(0, file.length - 4);

    pugs.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, SRC, file),
        filename: decideFileStructure(filename) + ".html",
      }),
    );
  }
});

module.exports = {
  mode: isProd ? "production" : "development",

  entry: path.resolve(__dirname, SRC, "js", "index.js"),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProd ? "bundle.[hash].js" : "bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !isProd,
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.pug$/,
        use: "pug-loader",
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([{ from: "assets/", to: "static" }], { logLevel: "silent" }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].css",
    }),
    ...pugs,
    new HtmlWebpackPugPlugin(),
  ],

  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },

  devServer: {
    disableHostCheck: true,
    compress: true,
    inline: true,
    port:server_port,
    host:server_host    
    },
};
