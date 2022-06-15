const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
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
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
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
  output: {
    filename: "[name].[fullhash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
    }),
    new MiniCssExtractPlugin({ filename: (data) => `${data.chunk.name}.${data.hash}.css` }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", filter: (path) => !path.includes(".html") }],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      FRONTEND_URI: "https://shopping-list-app-d0386.web.app/",
      NOTIFICATION_URI: "https://shopping-list-notifications.herokuapp.com/",
    }),
  ],
};
