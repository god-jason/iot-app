<template>
	<view class="page">

		<uni-card>
			<uni-list :border="false">

				<uni-list-item v-for="(setting, index) in model.content.filter(s=>user.admin || !s.hidden)" :key="index"
					:title="setting.label||setting.name" show-arrow clickable
					@click="openSetting(index)"></uni-list-item>
			</uni-list>
		</uni-card>

		<view class="buttons">
			<button type="primary" @click="clear">清空配置</button>
		</view>
	</view>
</template>
<script>
	import {
		getSetting
	} from '../../utils/model'
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
		data() {
			return {
				id: undefined,
				product_id: undefined,
				model: {
					content: []
				}
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad(options) {
			this.id = options.id
			this.product_id = options.product_id
			this.load()
		},
		methods: {
			async load() {
				this.model = await getSetting(this.product_id, "setting")
			},
			openSetting(index) {
				uni.navigateTo({
					url: '/pages/device/setting?id=' + this.id + "&product_id=" + this.product_id + "&index=" +
						index
				})
			},
			async clear() {
				uni.showModal({
					title: "提示",
					content: "清空之后，设备将恢复到出厂配置",
					success: (res) => {
						if (res.confirm) {
							//先清空服务器配置
							get("device/" + this.id + "/setting/clear").then(res => {
								//再清空设备配置（TODO 连数据库也清了）
								post("device/" + this.id + "/action/reset", {
									name: "清空配置"
								}).then()

								//uni.navigateBack()
								uni.showToast({
									title: "清空完成",
									icon: "success"
								})
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.buttons {
		padding: 20px;
		display: flex;
	}
</style>