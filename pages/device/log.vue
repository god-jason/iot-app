<template>
	<view class="page">
		<uni-card :title="v.created" v-for="(v, k) in logs" :key="k" @click="v.ellipsis=true">
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
		get,
		post
	} from '../../utils/request'

	export default {
		data() {
			return {
				id: undefined,
				logs: []
			}
		},
		onLoad(options) {
			this.id = options.id
			this.load()
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.logs =[]
			this.load()
		},
		onReachBottom() {
			this.load()
		},
		methods: {
			async load() {
				let res = await post("table/device_log/search", {
					filter: {
						device_id: this.id
					},
					skip: this.logs.length,
					limit: 10,
					sort: {
						id: -1
					}
				})
				if (res.data && res.data.length > 0)
				this.logs = this.logs.concat(res.data)
			}
		},
	}
</script>

<style scoped>
.ellipsis{
	max-height: 200rpx;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>