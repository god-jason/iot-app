<template>
	<view class="page">
		<uni-card :title="v.created" :extra="v.user || ''" v-for="(v, k) in logs2" :key="k" @click="v.ellipsis=true">
			<view :class="{ellipsis: !v.ellipsis}">
				<text>
					{{v.content}}
				</text>
			</view>
		</uni-card>
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
				id: undefined,
				logs: [],
				logs2: [],
			}
		},
		onLoad(options) {
			this.id = options.id
			this.load()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.logs = []
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
				let res = await post("table/device_log/search", {
					filter: {
						device_id: this.id
					},
					joins: [{
						"table": "user",
						"local_field": "user_id",
						"foreign_field": "id",
						"field": "name",
						"as": "user"
					}],
					skip: this.logs.length,
					limit: 20,
					sort: {
						"id": -1
					}
				})
				if (res.data && res.data.length > 0)
					this.logs = this.logs.concat(res.data)

				//非管理员，只显示操作日志
				if (this.user.admin)
					this.logs2 = this.logs
				else
					this.logs2 = this.logs.filter(v => {
						return !v.content.startsWith("###") && !v.content.startsWith("[")
					})
			}
		},
	}
</script>

<style scoped>
	.ellipsis {
		max-height: 200rpx;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>