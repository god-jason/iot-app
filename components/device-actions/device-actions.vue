<template>
	<view>
		<uni-grid :column="2" :show-border="false" :square="false">
			<uni-grid-item v-for="(p, k) in actions" :key="k">

				<view v-if="p.type == 'button'" class="action-button" @click="actionClick(p)">
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'switch'" class="action-button">
					<switch :checked="p.bind ? values[p.bind] : false" @change="actionValueChange(p, $event)" />
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'slider'" class="action-button">
					<slider :value="p.bind ? values[p.bind] : 0" @change="actionValueChange(p, $event)" />
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'form'" class="action-button" @click="actionForm(p, k)">
					<text class="action-label">
						{{p.label}}
					</text>
				</view>

				<view v-else class="action-button" @click="actionClick(p)">
					<text class="action-label">{{p.label}}</text>
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
		name: "device-actions",
		props: {
			id: String,
			product: String,
			values: Object,
			batch: Boolean,
		},
		data() {
			return {
				batch: false,
				actions: [],
			};
		},
		computed: {
			...mapState(userStore, ['user']),
		},
		mounted() {
			this.loadAction()
		},
		methods: {
			async loadAction() {

				let res = await getSetting(this.product, "action")
				this.actions = []
				res.content.forEach(a => {
					if (a.hidden && !this.user.admin) return
					this.actions.push(a)
				})

				console.log(this.points, this.actions)
			},

			checkBatchResult(succ) {
				if (succ) this.batch_result.success++
				else this.batch_result.fail++

				//console.log("checkBatchResult", succ, this.batch_result)				

				let pro = this.batch_result.success + this.batch_result.fail

				if (pro >= this.batch_result.total) {
					uni.hideLoading()

					let text = "批量操作完成"
					if (this.batch_result.success > 0)
						text += ", 成功" + this.batch_result.success + "条"
					if (this.batch_result.fail > 0)
						text += ", 失败" + this.batch_result.fail + "条"
					// uni.showToast({
					// 	icon: 'success',
					// 	title: text,
					// 	duration: 5000
					// })
					uni.showModal({
						title: "提示",
						content: text
					})
				} else {
					let text = "批量操作执行中"
					if (this.batch_result.success > 0)
						text += ", 成功" + this.batch_result.success + "条"
					if (this.batch_result.fail > 0)
						text += ", 失败" + this.batch_result.fail + "条"
					uni.showLoading({
						title: text
					})
				}
			},

			async actionClick(action) {
				if (this.batch) {
					uni.navigateTo({
						url: "/pages/device/select",
						events: {
							devices: (devices) => {
								if (devices.length == 0)
									return

								uni.showLoading({
									title: "执行中"
								})

								this.batch_result = {
									total: devices.length,
									success: 0,
									fail: 0,
								}
								for (var index = 0; index < devices.length; index++) {
									var id = devices[index];
									post("device/" + id + "/action/" + action.name, {
										//name: action.label
									}).then((res) => {
										console.log("batch then", res)
										this.checkBatchResult(true)
									}).catch(err => {
										console.log("batch catch", err)
										this.checkBatchResult(false)
									})
								}
							}
						}
					})
					return
				}

				let res = await post("device/" + this.id + "/action/" + action.name, {
					//name: action.label,
				})
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
			},
			async actionValueChange(action, $event) {
				if (this.batch) {
					uni.navigateTo({
						url: "/pages/device/select",
						events: {
							devices: (devices) => {
								if (devices.length == 0)
									return

								uni.showLoading({
									title: "执行中"
								})

								this.batch_result = {
									total: devices.length,
									success: 0,
									fail: 0,
								}

								//console.log("get batches", devices)
								for (var index = 0; index < devices.length; index++) {
									var id = devices[index];
									post("device/" + id + "/action/" + action.name, {
										//[action.bind || "value"]: $event.detail.value
										//name: action.label,
										value: $event.detail.value,
									}).then((res) => {
										console.log("batch then", res)
										this.checkBatchResult(true)
									}).catch(err => {
										console.log("batch catch", err)
										this.checkBatchResult(false)
									})
								}
							}
						}
					})
					return
				}

				console.log(action, $event.detail.value)
				let res = await post("device/" + this.id + "/action/" + action.name, {
					//[action.bind || "value"]: $event.detail.value
					//name: action.label,
					value: $event.detail.value,
				})
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
			},
			actionForm(action, index) {

				uni.navigateTo({
					url: "/pages/device/action?id=" + this.id + "&product_id=" + this.product +
						"&index=" + index,

					success: (res) => {

						//批量操作，需要打开设备选择，并将选择结果返回给form
						if (this.batch)
							setTimeout(() => {
								uni.navigateTo({
									url: "/pages/device/select",
									events: {
										devices: (devices) => {
											// uni.navigateTo({
											// 	url: "/pages/device/action?id=" + devices + "&product_id=" + this
											// 		.device.product_id +
											// 		"&index=" + index
											// })
											res.eventChannel.emit("devices", devices)
										},
										//TODO 取消多选时，应该也返回页面
									}
								})
							}, 1000)

					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.action-button {
		font-size: 20px;
		font-weight: bold;
		margin: 5px;
		padding: 20px 0;
		//width: 100%;
		height: 100%;
		min-height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		//border: 1px solid #c0c0c0;
		//border-radius: 5px;
		//background-color: #f0f0f0;
		//margin: 10rpx;
		//color: black;
		color: #d8d8d8;
		background-color: #474747;

		border-radius: 10rpx;
		//border: 4rpx solid #cbcbcb;
		letter-spacing: 4rpx;

		--border-radius: 5px;
		box-shadow: inset -1px -1px 4px #000, -1px -1px 5px #000;
		--text-shadow: 1px 1px 5px #101010;
	}

	.action-label {
		margin-top: 20rpx;
		//color: black;
		color: #eaeaea;
		letter-spacing: 4rpx;
		text-shadow: 1px 1px 5px #000;
	}

</style>