<template>
	<view>
		
		<uni-card title="基础参数">
			<uni-forms ref="form" :label-width="100">
				<uni-forms-item label="设定温度上限">
					<uni-easyinput type="integer" placeholder="10-30℃" />
				</uni-forms-item>
				<uni-forms-item label="设定温度下限">
					<uni-easyinput placeholder="10-30℃" />
				</uni-forms-item>
			</uni-forms>
		</uni-card>
		
		<uni-card title="高级参数" extra="限管理员">
			<uni-forms ref="form" :label-width="100">
				<uni-forms-item label="设定1级转速">
					<uni-easyinput placeholder="10-3000rpm" />
				</uni-forms-item>
				<uni-forms-item label="设定2级转速">
					<uni-easyinput placeholder="10-3000rpm" />
				</uni-forms-item>
				<uni-forms-item label="设定3级转速">
					<uni-easyinput placeholder="10-3000rpm" />
				</uni-forms-item>
				<uni-forms-item label="设定4级转速">
					<uni-easyinput placeholder="10-3000rpm" />
				</uni-forms-item>
				<uni-forms-item label="设定5级转速">
					<uni-easyinput placeholder="10-3000rpm" />
				</uni-forms-item>
			</uni-forms>
		</uni-card>
		
		<button type="primary">保存</button>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
