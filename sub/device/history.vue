<template>
	<view class="content">
		<!-- <l-echart ref="chart" @finished="init"></l-echart> -->
		<view class="toolbar">
			<uni-datetime-picker v-model="datetimerange" type="datetimerange" rangeSeparator="至"
				@change="change($event)" />
		</view>

		<uni-echarts custom-class="uni-chart" :option="option"></uni-echarts>

		<view class="btns">

			<view class="btn" @click="back">
				<uni-icons type="back" size="40px" color="white"></uni-icons>
			</view>
			<view class="btn" @click="minus">
				<uni-icons type="minus" size="40px" color="white"></uni-icons>
			</view>
			<view class="btn" @click="refresh">
				<uni-icons type="refresh" size="40px" color="white"></uni-icons>
			</view>
			<view class="btn" @click="plus">
				<uni-icons type="plus" size="40px" color="white"></uni-icons>
			</view>
			<view class="btn" @click="forward">
				<uni-icons type="forward" size="40px" color="white"></uni-icons>
			</view>
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

	let minutes = 4 * 60
	let start = dayjs().subtract(minutes, "minutes")
	let end = dayjs()

	let datetimerange = ref([
		start.format('YYYY-MM-DD HH:mm:ss'),
		end.format('YYYY-MM-DD HH:mm:ss')
	])

	let window = 1
	let unit = "s"
	let method = "last"

	function change($event) {
		console.log("change", $event)
		start = dayjs($event[0])
		end = dayjs($event[1])

		// 反推时差
		minutes = Math.ceil(e.diff(s, "minutes"))

		load()
	}

	function load() {
		if (end.isAfter(dayjs()))
			end = dayjs()
		if (start.isAfter(end))
			start = end.subtract(1, "minutes")

		// 计算时差
		minutes = end.diff(start, "minutes")

		console.log("load minutes", minutes)

		//回写到控件
		datetimerange.value = [
			start.format('YYYY-MM-DD HH:mm:ss'),
			end.format('YYYY-MM-DD HH:mm:ss')
		]

		uni.showLoading({
			title: "加载中"
		})

		get('device/' + id + '/history/' + point, {
			start: start.toISOString(),
			end: end.toISOString(),
			window: window + unit,
			method: method
		}).then(res => {
			console.log(res)

			let data = []

			res.data.forEach(d => {
				data.push([d.time, d.value])
			})

			console.log(data)

			//option.value.xAxis.data = x
			option.value.series[0].name = point
			option.value.series[0].data = data
		}).catch(err => {}).finally(() => {
			uni.hideLoading()
		})

	}

	function refresh() {
		start = dayjs().subtract(4, "hours")
		end = dayjs()
		load()
	}

	function back() {
		start = start.subtract(minutes / 3, "minutes")
		end = end.subtract(minutes / 3, "minutes")
		load()
	}

	function forward() {
		if (end.isAfter(dayjs())) {
			uni.showToast({
				title: "到尽头"
			})
			return
		}
		start = start.add(minutes / 3, "minutes")
		end = end.add(minutes / 3, "minutes")
		load()
	}

	function minus() {
		start = start.subtract(minutes / 2, "minutes")
		end = end.add(minutes / 2, "minutes")
		load()
	}

	function plus() {
		if (minutes < 10) {
			uni.showToast({
				title: "不能再放大了"
			})
			return
		}
		start = start.add(minutes / 4, "minutes")
		end = end.subtract(minutes / 4, "minutes")
		load()
	}

	onLoad((options) => {
		id = options.id
		point = options.point

		load()
	})
</script>

<style lang="scss">
	.content {
		width: 100vw;
		height: 100vh;
	}

	/* 	.content {
		width: 100vh;
		height: 100vw;
		
		transform: rotate(90deg) translateY(-100vw);
		transform-origin: left top;		
	} */
	.toolbar {
		display: flex;
		padding: 10rpx;
	}

	.btns {
		display: flex;
		padding: 0 20rpx;

		//justify-content: space-between;
		justify-content: space-around;
	}

	.btn {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		//border: 1px solid grey;
		display: flex;
		justify-content: center;
		align-items: center;

		background-color: #515151;
		box-shadow: 1px 1px 5px #000;
	}

	.uni-chart {
		height: 350px
	}
</style>