<template>
	<view style="width:750rpx; height:750rpx">
		<!-- <l-echart ref="chart" @finished="init"></l-echart> -->
		<uni-echarts custom-class="uni-chart" :option="option"></uni-echarts>

		<view class="toolbar">
			<button size="mini" @click="query10m">10分钟</button>
			<button size="mini" @click="query1h">1小时</button>
			<button size="mini" @click="query1d">1天</button>
			<button size="mini" @click="query7d">7天</button>
			<button size="mini" @click="query1mon">1个月</button>
			<button size="mini" @click="query3mon">3个月</button>
		</view>
	</view>
</template>

<script setup>
	import dayjs from "dayjs";
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
		provideEcharts,
		provideEchartsTheme
	} from "@/uni_modules/xiaohe-echarts";
	import {
		get
	} from "../../utils/request";
	import {
		ref
	} from "vue";
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app";

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

	let option = ref({
		tooltip: {
			trigger: 'axis'
		},
		xAxis: {
			type: 'time',
			data: []
		},
		yAxis: {
			type: 'value'
		},
		series: [{
			//name: '-',
			type: 'line',
			//smooth: true,
			symbol: 'none',
			data: [],
		}]
	})

	let id = ""
	let point = ""
	let start = dayjs().subtract(5, "hour").toISOString()
	let end = dayjs().toISOString()
	let window = 5
	let unit = "m"
	let method = "last"

	async function load() {
		let res = await get('iot/device/' + id + '/history/' + point, {
			start: start,
			end: end,
			window: window + unit,
			method: method
		})
		console.log(res)

		let data = []

		res.data.forEach(d => {
			data.push([d.time, d.value])
		})

		console.log(data)

		//option.value.xAxis.data = x
		option.value.series[0].name = point
		option.value.series[0].data = data
	}


	const query10m = () => {
		start = dayjs().subtract(10, 'minute').toISOString()
		end = dayjs().toISOString()
		window = 1
		unit = 's'
		load()
	}
	
	const query1h = () => {
		start = dayjs().subtract(1, 'hour').toISOString()
		end = dayjs().toISOString()
		window = 10
		unit = 's'
		load()
	}

	const query1d = () => {
		start = dayjs().subtract(1, 'day').toISOString()
		end = dayjs().toISOString()
		window = 5
		unit = 'm'
		load()
	}

	const query7d = () => {
		start = dayjs().subtract(7, 'day').toISOString()
		end = dayjs().toISOString()
		window = 1
		unit = 'h'
		load()
	}
	
	const query1mon = () => {
		start = dayjs().subtract(1, 'month').toISOString()
		end = dayjs().toISOString()
		window = 1
		unit = 'h'
		load()
	}
	
	const query3mon = () => {
		start = dayjs().subtract(3, 'month').toISOString()
		end = dayjs().toISOString()
		window = 1
		unit = 'd'
		load()
	}

	onLoad((options) => {
		id = options.id
		point = options.point

		load()
	})
</script>

<style>
	.toolbar {
		display: flex;
	}

	.uni-chart {
		height: 300px
	}
</style>