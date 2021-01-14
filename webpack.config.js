const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [
                    'style-loader', 
                    {
                        loader: 'css-loader', options: { importLoaders: 1 }
                    },
                    'postcss-loader',
                ],
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        })
    ]
}