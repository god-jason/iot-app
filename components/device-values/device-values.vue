<template>
	<view>
		<view v-for="(p, k) in properties" :key="k">
			<uni-grid :column="3" :show-border="false" :square="false">
				<uni-grid-item v-for="(p, k) in p.points" :key="k" @click="open(p)">
					<view class="point">
						<view class="label">{{p.label}}{{p.unit}}</view>
						<view class="value">{{values.hasOwnProperty(p.name) ? values[p.name] : '-'}}</view>
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
		emits:["propertyClick"],
		props: {
			product: String,
			type: String,
			values: Object,
		},
		data() {
			return {
				properties: []
			};
		},
		mounted() {
			//console.log(this.device, this.product)

			//1、查询属性表，防止并发，重复
			getModel(this.product).then(res => {
				let model = res || {
					properties: [{}]
				}
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
		},
		methods: {
			open(prop) {
				this.$emit("propertyClick", prop)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.point {
		text-align: center;
		font-size: 16px;
		color: black;
		//font-weight: bold;

		padding: 10rpx 0;
		//border: 1px solid #c0c0c0;
		margin: 10rpx 0;

		.label {
			font-size: 16px;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		.value {
			color: black;
			font-weight: bold;
			padding: 10px 0;
			font-size: 32px;
		}

	}
</style>