/**
 * 作者：yeshengqiang
 * 时间：2019-06-26
 * 描述：别名
 */
const { convertSep, pathResolve } = require('./utils');

module.exports = {
	resolve: ['.vue', '.js', '.jsx', '.json'],
	'@': convertSep(pathResolve('./src'), '/'),
	package: convertSep(pathResolve('./package'), '/')
};
