const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		https:true,
		compress:false,
		port:3000,
		host:'0.0.0.0',
		hot:true,
		//publicPath: './src/staticx',
		liveReload:true,
		writeToDisk: true,
		serveIndex: true,
		//public: './src/static'
	}
});
