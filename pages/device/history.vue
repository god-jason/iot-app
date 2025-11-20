<template>
	<view style="width:750rpx; height:750rpx">
		<!-- <l-echart ref="chart" @finished="init"></l-echart> -->
		<uni-echarts custom-class="chart" :option="option"></uni-echarts>

		<view class="toolbar">
			<button size="mini">近1天</button>
			<button size="mini">近5天</button>
			<button size="mini">近1个月</button>
			<button size="mini">近3个月</button>
			<button size="mini">近6个月</button>
		</view>
	</view>
</template>

<script setup>
	import {
		LineChart
	} from "echarts/charts";
	import {
		DatasetComponent,
		LegendComponent,
		TooltipComponent,
		GridComponent,
	} from "echarts/components";
	import * as echarts from "echarts/core";
	import {
		use
	} from "echarts/core";
	import {
		CanvasRenderer
	} from "echarts/renderers";
	import {
		ref
	} from "vue";
	import {
		provideEcharts,
		provideEchartsTheme
	} from "@/uni_modules/xiaohe-echarts";

	provideEcharts(echarts);

	// 此处仅用于演示通过 provide 修改图表 theme 的方式，不是必需
	//provideEchartsTheme("dark");

	use([
		LegendComponent,
		TooltipComponent,
		DatasetComponent,
		LineChart,
		CanvasRenderer,
		GridComponent
	]);

	const option = ref({
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

	})
</script>

<style scoped>
	.toolbar {
		display: flex;
	}

	.chart {
		height: 300px
	}
</style>