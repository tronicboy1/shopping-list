const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./sw/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
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
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "firebase-messaging-sw.js",
    path: path.resolve(__dirname, "public"),
    clean: false,
    iife: false,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      FRONTEND_URI: "https://shopping-list-app-d0386.web.app/",
      NOTIFICATION_URI: "https://shopping-list-notifications.herokuapp.com/",
    }),
  ],
};
