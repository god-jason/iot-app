<template>
	<view class="points">
		<uni-grid :column="3" :show-border="false" :square="false">
			<uni-grid-item v-for="(p, k) in points" :key="k">
				<view class="point">
					<view class="inner" @click="onPropertyClick(p)">
						<view class="label">{{p.label}}{{p.unit||''}}</view>
						<view class="value">{{formatValue(p.name)}}</view>
					</view>
				</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>

	import {
		getSetting
	} from '../../utils/model';
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';
	import {
		get,
		post
	} from '../../utils/request'

	export default {
		name: "device-values",
		props: {
			id: String,
			product: String,
			values: Object,
		},
		data() {
			return {
				batch: false,
				points: [],
			};
		},
		computed: {
			...mapState(userStore, ['user']),
		},
		mounted() {
			this.loadModel()
		},
		methods: {
			async loadModel(){
				console.log("load model", this.id, this.product)
				
				let res = await getSetting(this.product, "model")
				if (!res) {
					uni.showToast({
						icon: "error",
						title: "找不到物模型"
					})
					return
				}
				
				console.log("model", res)
				
				this.points = []
				res.content.forEach(p => {
					if (p.hidden && !this.user.admin) return
					p.points.forEach(pp => {
						if (pp.name) {
							this.points.push(pp)
						}
						pp.bits && pp.bits.forEach(b => {
							this.points.push(b)
						})
					})
				})
			},
			formatValue(name) {
				if (!this.values.hasOwnProperty(name))
					return "-"
				let val = this.values[name]
				switch (typeof(val)) {
					case "boolean":
						return val ? "通" : "断"
				}
				return val;
			},
			onPropertyClick(property) {
				if (typeof this.values[property.name] != "number")
					return
				uni.navigateTo({
					url: "/sub/device/history?id=" + this.id + "&point=" + property.name
				})
			},
		}
	}
</script>

<style lang="scss" scoped>

	.points {
		background-color: #393939;
	}

	.point {
		font-size: 16px;
		//color: black;
		//font-weight: bold;

		padding: 10rpx;


		//margin: 10rpx 0;
		.inner {
			background-color: #2f2f2f;
			//border: 1rpx solid #202939;
			border-radius: 8rpx;
			padding: 10rpx 20rpx;
			box-shadow: inset 1px 1px 5px #000;
		}

		.label {
			color: #bcbcbc;
			font-size: 14px;

			//禁止换行
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow-x: hidden;
			width: 100%;
		}

		.value {
			text-align: center;
			//color: black;
			font-weight: bold;
			padding: 5px 0;
			font-size: 28px;
			text-shadow: 1px 1px 5px black;

		}

	}
</style>