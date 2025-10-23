<template>
	<view>
		
		<uni-card title="个人信息">
			<uni-forms ref="form" :label-width="100">
				<uni-forms-item label="手机号">
					<uni-easyinput placeholder="eg 188688..." />
				</uni-forms-item>
				<uni-forms-item label="昵称">
					<uni-easyinput placeholder="" />
				</uni-forms-item>
				<uni-forms-item label="性别">
					<radio-group>
						<label>
							<radio value="男" /><text>男</text>
						</label>
						<label>
							<radio value="女" /><text>女</text>
						</label>
					</radio-group>
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
