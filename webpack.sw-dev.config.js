const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: { "firebase-messaging-sw": "./sw/index.ts", "list-listener": "./sw/web-workers/list-listener/index.ts" },
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: { loader: "ts-loader", options: { configFile: "tsconfig.dev.json" } },
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
      NODE_ENV: "development",
      FRONTEND_URI: "https://shopping-list-app-d0386.web.app/",
      NOTIFICATION_URI: "https://shopping-list-notifications.herokuapp.com/",
    }),
  ],
};
