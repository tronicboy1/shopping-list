const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: { "firebase-messaging-sw": "./sw/index.ts", "list-listener": "./sw/web-workers/list-listener/index.ts" },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-typescript"],
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "public"),
    clean: false,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      FRONTEND_URI: "https://shopping-list-app-d0386.web.app/",
      NOTIFICATION_URI: "https://shopping-list-notifications.herokuapp.com/",
    }),
  ],
};
