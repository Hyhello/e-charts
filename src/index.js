/**
 * 作者：Hyhello
 * 时间：2019-07-13
 * 描述：初始化
 */

import ECharts from 'package/hecharts/index.vue';

const install = function(Vue) {
	if (install.installed) return;
	install.installed = true;
	Vue.component(ECharts.name, ECharts);
};

export default install;
