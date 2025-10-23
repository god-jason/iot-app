<template>
	<view>

		<uni-card title="绑定设备">
			<uni-forms ref="form" :label-width="100">
				<uni-forms-item label="组织">
					
					<picker mode="selector" :range="groups" range-key="name" :value="index" @change="">
						<view>{{groups[index].name}}</view>
					</picker>
				</uni-forms-item>
				<uni-forms-item label="SN号">
					<uni-easyinput placeholder="eg 8634..."  suffixIcon="scan" @iconClick=""/>
				</uni-forms-item>
			</uni-forms>
			<button type="primary">绑定</button>
		</uni-card>


	</view>
</template>

<script>
	export default {
		data() {
			return {
				index: 0,
				groups: [
					{name: '南京真格智能科技有限公司'},
					{name: '南京本易物联网有限公司'},
					{name: '南京黑白科技有限公司'},
				]
			}
		},
		methods: {

		}
	}
</script>

<style>

</style>