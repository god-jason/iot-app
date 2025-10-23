<template>
	<view>
		<uni-search-bar placeholder="搜索" @confirm="search"></uni-search-bar>

		<uni-list>
			<uni-list-item v-for="(group, index) in groups" :key="group.id" :title="group.name"
				clickable link="navigateTo" :to="'/pages/group/detail?id='+group.id">
			</uni-list-item>
		</uni-list>
		
	</view>

</template>

<script>
	export default {
		data() {
			return {

				// 搜索关键词
				searchKeyword: '',

				// 模拟设备数据
				groups: [{
						id: "123123",
						name: '南京真格智能科技有限公司',
						online: true,
						switchStatus: 'on',
						updateTime: '2024-01-20 14:30:25'
					},
					{
						id: "123124",
						name: '南京本易物联网有限公司',
						switchStatus: 'off',
						updateTime: '2024-01-20 14:28:10'
					}
				]
			}
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			//TODO 加载
		},
		onReachBottom() {
			console.log("bottom")
			//TODO 加载更多
		},
		mounted() {
			//TODO 加载
		},
		methods: {
			open(group) {
				uni.navigateTo({
					url: "/pages/group/detail?id=" + group.id,
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
</style>