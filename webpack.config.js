const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const webpack = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

const port = 9000;

module.exports = {
  entry: { main: "./src/index.ts" },
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  resolve: {
    alias: {
      "@web-components": path.resolve(__dirname, "src/web-components/"),
      "@firebase-logic": path.resolve(__dirname, "src/firebase.ts"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    https: {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
    compress: true,
    port,
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  plugins: [
    new WebpackManifestPlugin({ fileName: "public-manifest.json" }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      chunks: ["main"],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      FRONTEND_URI: `https://localhost:${port}/`,
      NOTIFICATION_URI: "https://shopping-list-notifications.herokuapp.com/",
    }),
  ],
};
