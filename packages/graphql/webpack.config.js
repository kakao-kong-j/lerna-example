const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".mjs", ".js", ".jsx", ".json"],
    modules: [path.resolve(__dirname), "node_modules"]
  },
  plugins: [
    new webpack.DefinePlugin({
      "global.GENTLY": false
    })
  ],
  target: "node"
};
