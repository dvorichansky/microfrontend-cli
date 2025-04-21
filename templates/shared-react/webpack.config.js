const dotenv = require('dotenv');
const { withModuleFederation } = require('@module-federation/enhanced/webpack');

dotenv.config({ path: '.env.development' });

module.exports = withModuleFederation({
    name: 'sharedReact',
    filename: 'remoteEntry.js',
    exposes: {
        './Button': './src/components/Button',
        './useTheme': './src/hooks/useTheme',
    },
    shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
    },
    webpackConfig: {
        entry: './src/index.ts',
        mode: 'development',
        devtool: 'source-map',
        devServer: {
            port: 4100,
            open: true,
            historyApiFallback: true,
        },
        output: {
            publicPath: 'auto',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
    },
});
