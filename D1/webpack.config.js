const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './frontend/src/index.js',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './frontend/public/index.html'), // ✅ correct
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "frontend/public/assets"),
          to: "assets",
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, "frontend/public"),
      },
    ],
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
};
