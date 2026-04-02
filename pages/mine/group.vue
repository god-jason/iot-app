<template>
	<view class="page">

		<uni-card
			v-for="(g, index) in groups"
			:title="g.name"
			:key="g.id"
			class="group-card"
			:extra="g.id==group.id?'当前选择':''">
			<view class="card-row">
				<view class="left">
					<text class="role">{{ roleText(g) }}</text>
					<text v-if="g.agent_id" class="hosted-tag">托管</text>
					<button
						v-if="g.user_id!=user.id"
						class="quit-btn"
						size="mini"
						plain
						@click="quitGroup(g)">退出</button>
				</view>
				<button class="switch-btn" type="primary" size="mini" @click="switchGroup(g)">切换</button>
			</view>
		</uni-card>

		<view class="create-group">
			<button type="primary" @click="createGroup">创建组织</button>
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
	} from '../../utils/request';

	const user = userStore()

	export default {
		data() {
			return {
				groups: []
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			this.load()
		},
		methods: {
			roleText(g) {
				if (!g) return ''
				if (g.user_id == this.user.id) return '拥有者'
				return g.role || '成员'
			},
			async load(){
				this.groups = []
				this.loadOwns().then()
				this.loadMembers().then()
				this.loadAgentGroups().then()
			},
			async loadOwns(){
				let res = await post("table/group/search", {
					filter: {
						user_id: this.user.id
					}
				})
				if (res.data && res.data.length > 0) {
					this.groups = res.data
					this.groups.forEach(group=>{
						group.role = "拥有者"
					})
				}
			},
			async loadMembers() {
				

				//作为成员的
				let res2 = await post("table/member/search", {
					filter: {
						user_id: this.user.id
					}
				})
				if (res2.data && res2.data.length > 0) {
					for (let index = 0; index < res2.data.length; index++) {
						// let group_id = res2.data[index].group_id
						// let res = await get("table/group/detail/" + group_id)
						// let group = res.data
						// group.role = res2.data[index].role
						// this.groups.push(group)
						
						//以下方式数据不更新
						let group = res2.data[index]
						get("table/group/detail/" + group.group_id).then(res=>{
							Object.assign(group, res.data)
							group.role = res2.data[index].role
							this.groups.push(group)
						})
					}
				}
			},
			
			// 加载代理商托管的组织（agent_id 存储的是 user_id）
			async loadAgentGroups() {
				if (!this.user || !this.user.id) {
					return
				}
				
				try {
					// 按 agent_id（user_id）搜索组织
					const groupRes = await post("table/group/search", {
						filter: {
							agent_id: this.user.id
						}
					})
					
					if (groupRes && groupRes.data && groupRes.data.length > 0) {
						// 添加托管的组织，避免重复
						groupRes.data.forEach(group => {
							const exists = this.groups.find(g => g.id === group.id)
							if (!exists) {
								group.role = "托管"
								this.groups.push(group)
							}
						})
					}
				} catch (error) {
					console.error('加载代理商托管组织失败:', error)
					// 静默失败，不影响其他组织加载
				}
			},
			
			quitGroup(group){
				uni.showModal({
					title:"提示",
					content:"退出之前将无法访问该组织的任何数据",
					success: (res) => {
						if (res.confirm) {
							get('table/member/delete/'+group.id+'/'+this.user.id).then(()=>{
								this.load()
							})
						}
					}
				})
			},
			switchGroup(group){
				user.setGroup(group)
				uni.navigateBack()
			},

			// 创建组织
			createGroup() {
				uni.showModal({
					title: '创建组织',
					editable: true,
					placeholderText: '请输入组织名称',
					success: async (res) => {
						if (res.confirm) {
							const name = (res.content || '').trim()
							if (!name) {
								uni.showToast({
									title: '组织名称不能为空',
									icon: 'none'
								})
								return
							}

							try {
								const data = {
									name,
									user_id: this.user.id,
									disabled: false
								}
								const result = await post('table/group/create', data)
								if (result && (result.code === 0 || result.data)) {
									uni.showToast({
										title: '创建成功',
										icon: 'success'
									})
									// 重新加载组织列表
									this.load()
								} else {
									uni.showToast({
										title: (result && result.message) || '创建失败',
										icon: 'none'
									})
								}
							} catch (e) {
								uni.showToast({
									title: '创建失败，请稍后重试',
									icon: 'none'
								})
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.group-card {
		.card-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16rpx;
		}

		.left {
			display: flex;
			align-items: center;
			gap: 12rpx;
			min-width: 0;
		}

		.role {
			font-size: 26rpx;
			color: #666;
			white-space: nowrap;
		}
		
		.hosted-tag {
			font-size: 22rpx;
			color: #ff9500;
			background-color: #fff4e6;
			padding: 4rpx 12rpx;
			border-radius: 4rpx;
			margin-left: 8rpx;
		}

		.quit-btn {
			padding: 0 18rpx;
			height: 56rpx;
			line-height: 56rpx;
			font-size: 24rpx;
		}

		.switch-btn {
			padding: 0 20rpx;
			height: 56rpx;
			line-height: 56rpx;
			font-size: 24rpx;
		}

		/* 尽量压缩 uni-card 默认留白（不同端 class 可能略有差异，不影响功能） */
		::v-deep .uni-card {
			margin: 16rpx 20rpx;
		}
		::v-deep .uni-card__title {
			padding: 16rpx 20rpx 0;
		}
		::v-deep .uni-card__title-text {
			font-size: 28rpx;
		}
		::v-deep .uni-card__title-extra {
			font-size: 24rpx;
		}
		::v-deep .uni-card__content {
			padding: 12rpx 20rpx 16rpx;
		}
	}
	.create-group {
		margin: 20rpx;
	}
</style>