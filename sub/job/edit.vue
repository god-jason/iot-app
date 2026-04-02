<template>
	<view class="page">
		<uni-card>
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">


				<uni-forms-item label="时间" required name="time">
					<picker mode="time" :value="formData.time" @change="formData.time = $event.detail.value">
						<view>{{formData.time || "--:--"}}</view>
					</picker>
				</uni-forms-item>

				<uni-forms-item label="星期" name="weekdays">
					<uni-data-checkbox mode="tag" multiple v-model="formData.weekdays"
						:localdata="weekdays"></uni-data-checkbox>
				</uni-forms-item>
				
				<uni-forms-item label="单次">
					<switch :checked="formData.single" @change="formData.single = $event.detail.value" />
				</uni-forms-item>

				<button type="default" size="mini" @click="selectAction">选择执行的操作</button>

				<uni-forms-item label="名称">
					<uni-easyinput v-model="formData.name" />
				</uni-forms-item>

				<uni-forms-item label="操作">
					<uni-easyinput v-model="formData.action" />
				</uni-forms-item>

				<uni-forms-item label="数据">
					{{formData.data}}
				</uni-forms-item>
				
				<uni-forms-item label="禁用">
					<switch :checked="formData.disabled" @change="formData.disabled = $event.detail.value" />
				</uni-forms-item>
			</uni-forms>

			<view class="button-group">
				<button type="primary" @click="submit" :loading="loading">保存修改</button>
			</view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				weekdays: [{
					text: "一",
					value: 1
				}, {
					text: "二",
					value: 2
				}, {
					text: "三",
					value: 3
				}, {
					text: "四",
					value: 4
				}, {
					text: "五",
					value: 5
				}, {
					text: "六",
					value: 6
				}, {
					text: "日",
					value: 7
				}],
				formData: {}
			}
		},
		onLoad(options) {
			this.id = options.id
			this.gateway_id = options.gateway_id
			this.product_id = options.product_id
		},
		methods: {
			selectAction() {
				uni.navigateTo({
					url: "/sub/job/action?product_id=" + this.product_id,
					events: {
						action: action => {
							this.formData.action = action.action
							this.formData.name = action.name,
								this.formData.data = action.data
						}
					}
				})
			},
			submit() {
				console.log(this.formData)
			}
		}
	}
</script>

<style>

</style>