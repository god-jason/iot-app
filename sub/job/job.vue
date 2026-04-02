<template>
	<view class="page">
		<uni-card v-for="(job, index) in jobs" :key="index" :title="job.time">
			{{job.name || job.action}}
			<text v-if="job.data && job.data.hasOwnProperty('value')">
				：{{job.data.value ? '打开':'关闭'}}
			</text>

			<view class="btns">
				<button type="default" size="mini" @click="execute(index)">执行</button>
				<button type="default" size="mini" @click="remove(index)">删除</button>
				<button type="default" size="mini" :disabled="!job.disabled" @click="enable(index)">启用</button>
				<button type="default" size="mini" :disabled="job.disabled" @click="disable(index)">禁用</button>
			</view>
		</uni-card>

		<button type="default" @click="add">添加任务</button>
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
				pageSize: 20,
				jobs: [{
					time: "09:00",
					action: "open",
					name: '控制',
					data: {
						value: true
					}
				}]
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
		onPullDownRefresh() {
			this.jobs = []
			this.load()
		},
		onReachBottom() {
			console.log("到达底部")
			this.load()
		},
		methods: {
			async load() {
				let res = await post("table/job/search", {
					filter: {
						gateway_id: this.id
					},
					skip: this.jobs.length,
					limit: this.pageSize,
					sort: {
						name: 1
					}
				})

				if (res.data && res.data.length > 0) {
					this.jobs = this.jobs.concat(res.data)
					//this.total = res.total
				}
			},
			async execute(index) {
				
			},
			async remove(index) {
				this.jobs.splice(index, 1)
				await get("table/job/delete/" + this.jobs[index].id + "/" + this.id)
			},
			add() {
				uni.navigateTo({
					url: "/sub/job/edit?gateway_id="+this.id+"&product_id="+this.product_id
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.btns {
		display: flex;
	}
</style>