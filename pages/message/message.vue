<template>
	<view class="page">

		<uni-card v-for="(message, index) in messages" @click="open(message)"
		   :title="message.title"
			:extra="message.created">
			{{message.device}}
			{{message.message}}
		</uni-card>
		
		<view class="empty" v-if="messages.length == 0">
			无记录
		</view>

	</view>

</template>

<script>
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
				// 搜索关键词
				searchKeyword: '',

				// 模拟设备数据
				messages: []
			}
		},
		onLoad(options) {
			this.load()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.messages = []
			this.load()
		},
		onReachBottom() {
			this.load()
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		methods: {
			async load() {
				let res = await post("table/alarm/search", {
					filter: {
						group_id: this.group.id
					},
					joins: [{
						"table": "device",
						"local_field": "device_id",
						"foreign_field": "id",
						"field": "name",
						"as": "device"
					}],
					skip: this.messages.length,
					limit: 20,
					sort: {
						"id": -1
					}
				})
				if (res.data)
					this.messages = this.messages.concat(res.data)
			},
			open(message) {
				uni.navigateTo({
					url: "/pages/device/detail?id=" + message.device_id,
				})
			}
		}
	}
</script>

<style scoped>
	.item {
		text-align: center;
		padding: 5rpx 0;
	}
	.empty{
		padding: 15px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>