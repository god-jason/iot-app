<template>
	<view style="width:750rpx; height:750rpx">
		<l-echart ref="chart" @finished="init"></l-echart>
		
	<view class="toolbar">
		<button size="mini">近1天</button>
		<button size="mini">近5天</button>
		<button size="mini">近1个月</button>
		<button size="mini">近3个月</button>
		<button size="mini">近6个月</button>
	</view>
	</view>
</template>

<script>
	import * as echarts from 'echarts'
	export default {
		data() {
			return {
				option: {
					legend: {
						data: ['温度']
					},
					xAxis: {
						type: 'category',
						data: ['1时', '2时', '3时', '4时', '5时', '6时', '7时']
					},
					yAxis: {
						type: 'value'
					},
					series: [{
						name: '温度',
						type: 'line',
						smooth: true,
						data: [30, 27, 34, 34.4, 30, 32, 31],
					}]
				},
			};
		},
		// 组件能被调用必须是组件的节点已经被渲染到页面上
		methods: {
			async init() {
				// chart 图表实例不能存在data里
				const chart = await this.$refs.chart.init(echarts);
				chart.setOption(this.option)
			}
		}
	}
</script>

<style scoped>
.toolbar{
	display: flex;
}
</style>