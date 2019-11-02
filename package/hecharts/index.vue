/** * 作者：yeshengqiang * 时间：2019-06-03 * 描述：echarts 组件 */
<style lang="scss" scoped>
.echarts-panel {
	width: 100%;
	height: 100%;
	user-select: none;
	position: relative;

	.echarts-main {
		width: 100%;
		height: 100%;
	}

	.empty {
		position: absolute;
		top: 40%;
		left: 50%;
		margin: 0;
		z-index: 10;
		backface-visibility: hidden;
		transform: translate(-50%, -50%);
	}
}
</style>
<template>
	<div :role="type" class="echarts-panel">
		<div ref="echarts" class="echarts-main" />
		<transition name="fade">
			<!-- <Empty v-show="isEmpty" :type="emptyType" :color="emptyColor" :description="emptyText" class="empty">
            </Empty> -->
		</transition>
	</div>
</template>
<script>
// import Empty from '../empty';
import _ from 'lodash';
import echarts from 'echarts';
import { warn } from '@/utils/debug';
import mapList from '@/map/mapList.json';
import { addResizeListener, removeResizeListener } from '@/utils/resize-event';

const oneOf = (target, list) => {
	const temp = list.filter(item => item.value === target);
	return temp.length;
};

// 全国市区，特殊后缀集合
const specialCity = ['市', '盟', '自治州', '县', '区', '其他'];

const specialInclude = name => {
	return name.replace(
		new RegExp(`(.*)(?<!${specialCity.join('|')})$`),
		'$1市'
	);
};

// 加载
const reslove = (name, bool) => {
	const isProvince = bool ? 'province/' : '';
	return require(`echarts/map/json/${isProvince}${name}.json`);
};

// 过滤
const filterValue = name => {
	try {
		const map = mapList.filter(item => item.label === name)[0];
		return map.value;
	} catch (error) {
		return specialInclude(name);
	}
};

export default {
	name: 'HEcharts',
	components: {
		// Empty
	},
	props: {
		options: {
			type: Object,
			default() {
				return {};
			}
		},
		theme: {
			type: Object,
			default() {
				return {};
			}
		},
		// eslint-disable-next-line vue/require-default-prop
		map: {
			type: [String, Array],
			default: ''
			// validator(val) {
			// 	if (Array.isArray(val)) {
			// 		for (let i = 0; i < val.length; i++) {
			// 			return oneOf(val[i], mapList);
			// 		}
			// 	}
			// 	return oneOf(val, mapList);
			// }
		},
		type: {
			type: String,
			required: true
		},
		emptyType: {
			type: [String, Number],
			default: 3
		},
		emptyColor: {
			type: String,
			default: 'rgba(0,0,0,0.25)'
		},
		emptyText: {
			type: String,
			default: '暂无数据'
		}
	},
	data() {
		return {
			isEmpty: false
		};
	},
	watch: {
		options: {
			deep: true,
			handler(val) {
				this.setOption(val);
			}
		},
		map: {
			deep: true,
			handler() {
				// 注册地图
				this.formatMap();
				// 重绘一次
				this.setOption(this.options);
			}
		},
		theme: {
			deep: true,
			handler() {
				this.setTheme();
			}
		}
	},
	mounted() {
		if (this.map) {
			this.formatMap();
		}
		this._initCharts();
	},
	beforeDestroy() {
		this.destroyMap();
		this.$el.remove();
	},
	methods: {
		_initCharts() {
			this.$nextTick(() => {
				const el = this.$refs.echarts;
				this._echarts = echarts.init(el, this.theme);
				this.setOption(this.options);
				this._echarts.on('click', this.mapClick);
				this.__outSideResize__ = _.debounce(this.resize, 100);
				addResizeListener(el, this.__outSideResize__);
			});
		},
		setOption(val) {
			if (!this._echarts) return;
			this.isEmpty = _.isEmpty(val);
			this._echarts.clear();
			this._echarts.setOption(val, true);
		},
		formatMap() {
			const nameList = Array.isArray(this.map) ? this.map : [this.map];
			nameList.forEach(item => {
				const name = item === '中国' ? filterValue(item) : item;
				this.registerMap(name, filterValue(item));
			});
		},
		mapClick(e) {
			this.$emit('click', e);
		},
		// 地图resize
		resize() {
			if (!this._echarts) return;
			this._echarts.resize();
			this.$emit('resize');
		},
		// 销毁地图
		destroyMap() {
			if (!this._echarts) return;
			removeResizeListener(this.$refs.echarts, this.__outSideResize__);
			this._echarts.off('click', this.mapClick);
			this.__outSideResize__ = null;
			// 地图清空
			this._echarts.clear();
			// 地图销毁
			this._echarts.dispose();
			this._echarts = null;
		},
		// 由于echarts 3.0 不支持setTheme 导致
		setTheme() {
			this.destroyMap();
			this._initCharts();
		},
		registerMap(name, json) {
			if (!echarts) {
				warn('is not Loaded');
				return;
			}
			if (!echarts.registerMap) {
				warn('is not loaded');
				return;
			}
			if (!json) {
				return warn(`map matched fail ${name} not matched map`);
			}
			if (oneOf(json, mapList)) {
				try {
					json = reslove(json);
				} catch (e) {
					json = reslove(json, true);
				}
			} else {
				json = require(`@/map/json/${json}.json`);
			}
			echarts.registerMap(name, json);
		}
	}
};
</script>
