<template>
	<view>
		<view v-for="(p, k) in properties" :key="k">
			<uni-grid :column="3" :show-border="false" :square="false">
				<uni-grid-item v-for="(p, k) in p.points" :key="k" @click="open(p)">
					<view class="label">{{p.label}}</view>
					<view class="value">
						<text class="num">{{values[p.name] || '-'}}</text>
						<text class="unit">{{p.unit}}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</view>
	</view>
</template>

<script>
	import {
		getModel
	} from '../../utils/model';
	import {
		get
	} from '../../utils/request';

	export default {
		name: "device-values",
		props: {
			product: String,
			device: String,
			type: String,
		},
		data() {
			return {
				properties: [],
				values: {}
			};
		},
		mounted() {
			//console.log(this.device, this.product)

			//1、查询属性表，防止并发，重复
			getModel(this.product).then(res => {
				let model = res || {properties:[{}]}
				switch (this.type) {
					case "simple":
						//只保留第一个
						this.properties = [{
							points: model.properties[0].points
						}]
						break;
					case "full":
						this.properties = model.properties
						break;
					default:
						this.properties = model.properties
						break
				}
			})

			//2、查询实时状态
			get("iot/device/" + this.device + "/values").then(res => {
				this.values = res.data
			})
		},
		methods: {
			open(prop) {
				this.$emit("property-click", prop)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.label {}

	.value {
		.num {
			font-size: 1.2em;
			font-weight: bold;
		}
	}
</style>