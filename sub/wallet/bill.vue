<template>
	<view class="page">
		<uni-card v-if="bills.length > 0">
			<uni-list>
				<uni-list-item 
					v-for="(bill, index) in bills" 
					:key="bill.id || index"
					:title="bill.description || '账单记录'"
					:note="formatTime(bill.created_at || bill.createdAt || bill.time)"
					:rightText="formatAmount(bill.amount, bill.type)"
					:rightTextStyle="getAmountStyle(bill.type)">
					<template v-slot:header>
						<view class="bill-header">
							<text class="bill-type">{{ getTypeText(bill.type) }}</text>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 空状态 -->
		<view v-if="!loading && bills.length === 0" class="empty-state">
			<view class="empty-content">
				<uni-icons type="wallet" size="80" color="#ccc"></uni-icons>
				<text class="empty-text">暂无账单记录</text>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading && bills.length === 0" class="loading-state">
			<uni-load-more status="loading" content="加载中..."></uni-load-more>
		</view>

		<!-- 加载更多 -->
		<view v-if="bills.length > 0" class="load-more">
			<uni-load-more 
				:status="loadMoreStatus" 
				:content-text="loadMoreText">
			</uni-load-more>
		</view>
	</view>
</template>

<script>
	import { post } from '../../utils/request';
	import dayjs from 'dayjs';

	export default {
		data() {
			return {
				bills: [],
				loading: false,
				pageSize: 20,
				skip: 0,
				hasMore: true,
				loadMoreStatus: 'more' 
			}
		},
		computed: {
			loadMoreText() {
				return {
					contentdown: '上拉加载更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多数据了'
				};
			}
		},
		onLoad() {
			this.loadBills();
		},
		onPullDownRefresh() {
			this.refresh();
		},
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.loadMore();
			}
		},
		methods: {
			// 加载账单
			async loadBills() {
				if (this.loading) return;
				
				this.loading = true;
				try {
					const res = await post('wallet/bill/search', {
						filter: {},
						skip: this.skip,
						limit: this.pageSize,
						sort: {
							created_at: -1
						}
					});
					
					if (res && res.data) {
						if (this.skip === 0) {
							this.bills = res.data;
						} else {
							this.bills = this.bills.concat(res.data);
						}
						
						this.hasMore = res.data && res.data.length === this.pageSize;
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
					}
				} catch (error) {
					console.error('加载账单失败:', error);
					uni.showToast({
						title: '加载账单失败',
						icon: 'error'
					});
				} finally {
					this.loading = false;
					uni.stopPullDownRefresh();
				}
			},
			
			// 刷新
			async refresh() {
				this.skip = 0;
				this.hasMore = true;
				await this.loadBills();
			},
			
			// 加载更多
			async loadMore() {
				if (!this.hasMore || this.loading) return;
				
				this.skip += this.pageSize;
				this.loadMoreStatus = 'loading';
				await this.loadBills();
			},
			
			// 格式化时间
			formatTime(timeString) {
				if (!timeString) return '';
				try {
					return dayjs(timeString).format('YYYY-MM-DD HH:mm:ss');
				} catch (e) {
					return timeString;
				}
			},
			
			// 格式化金额
			formatAmount(amount, type) {
				const num = parseFloat(amount) || 0;
				const prefix = type === 'recharge' ? '+' : '-';
				return `${prefix}¥${num.toFixed(2)}`;
			},
			
			// 获取金额样式
			getAmountStyle(type) {
				return {
					color: type === 'recharge' ? '#4cd964' : '#ff3b30',
					fontSize: '32rpx',
					fontWeight: 'bold'
				};
			},
			
			// 获取类型文本
			getTypeText(type) {
				return type === 'recharge' ? '充值' : '消费';
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bill-header {
		.bill-type {
			font-size: 24rpx;
			color: #999;
			padding: 4rpx 12rpx;
			background-color: #f5f5f5;
			border-radius: 4rpx;
		}
	}
	
	.uni-card {
		margin: 20rpx 30rpx;
		margin-top: 40rpx;
	}
	
	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400rpx;
		
		.empty-content {
			text-align: center;
			
			.empty-text {
				display: block;
				font-size: 32rpx;
				color: #999;
				margin-top: 20rpx;
			}
		}
	}
	
	.loading-state {
		padding: 40rpx 0;
		text-align: center;
	}
	
	.load-more {
		padding: 40rpx 0;
	}
</style>





