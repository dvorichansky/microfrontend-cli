const dotenv = require('dotenv');
const { withModuleFederation } = require('@module-federation/enhanced/webpack');

dotenv.config({ path: '.env.development' });

module.exports = withModuleFederation({
    name: 'shared',
    filename: 'remoteEntry.js',
    exposes: {
        './utils': './src/utils/index.ts',
        './types': './src/types/index.ts',
        './constants': './src/constants/index.ts',
    },
    shared: {},
    webpackConfig: {
        entry: './src/index.ts',
        mode: 'development',
        devtool: 'source-map',
        devServer: {
            port: 4000,
            open: true,
            historyApiFallback: true,
        },
        output: {
            publicPath: 'auto',
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
    },
});
