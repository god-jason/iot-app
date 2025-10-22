<template>
	<view>
		<uni-grid :column="3" :show-border="false" :square="false">
			<uni-grid-item v-for="(p, k) in properties" :key="k" @click="open(p)">
				<view>{{p.label}}</view>
				<view>1.33{{p.unit}}</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>
	export default {
		name:"device-values",
		props: {
			device: String,
			product: String,
			type: String,
		},
		data() {
			return {
				properties: [{
						name: "temperature",
						label: "温度",
						unit: "℃"
					},
					{
						name: "humidity",
						label: "湿度",
						unit: "%RH"
					},
					{
						name: "voltage",
						label: "电压",
						unit: "V"
					},
					{
						name: "current",
						label: "电流",
						unit: "A"
					},
					{
						name: "power",
						label: "功率",
						unit: "kWh"
					}
				],
				
			};
		},
		mounted(){
			console.log(this.device, this.product)
			//TODO 1、查询属性表，防止并发，重复
			//TODO 2、查询实时状态
		},
		methods:{
			open(prop){
				this.$emit("property-click", prop)
			}
		}
	}
</script>

<style lang="scss">

</style>