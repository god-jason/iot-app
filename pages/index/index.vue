<template>
  <view class="index-container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="greeting">你好，{{ userName }}</text>
      <view class="user-avatar" @click="showUserMenu">
        <image class="avatar" src="/static/icon_index/avatar.png" mode="aspectFill"></image>
      </view>
    </view>

    <!-- 功能网格 -->
    <view class="function-grid">
      <view 
        v-for="(item, index) in functionList" 
        :key="index"
        class="grid-item"
        @click="navigateToFunction(item.path)"
      >
        <view class="item-icon" :style="{ backgroundColor: item.color }">
          <image class="icon" :src="item.icon" mode="aspectFit"></image>
        </view>
        <text class="item-title">{{ item.title }}</text>
        <text class="item-desc">{{ item.desc }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <button class="action-btn logout" @click="handleLogout">
        <image class="btn-icon" src="/static/icon_index/logout.png" mode="aspectFit"></image>
        <text>退出登录</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userName: '用户',
      functionList: [
        {
          icon: '/static/icon_index/home.png',
          title: '主页',
          desc: '查看主页信息',
          path: '/pages/stats/stats',
          color: '#ff6b6b'
        },
        {
          icon: '/static/icon_index/device.png',
          title: '设备',
          desc: '配置设备参数',
          path: '/pages/settings/settings',
          color: '#96ceb4'
        },
        {
          icon: '/static/icon_index/history.png',
          title: '历史曲线',
          desc: '显示设备温度',
          path: '/pages/chart/files',
          color: '#feca57'
        },
        {
          icon: '/static/icon_index/map.png',
          title: '地图',
          desc: '查看地图信息',
          path: '/pages/maps/maps',
          color: '#ff9ff3'
        }
      ]
    }
  },
  onLoad() {
    this.checkLoginStatus()
    this.loadUserInfo()
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const isLoggedIn = uni.getStorageSync('isLoggedIn')
      if (!isLoggedIn) {
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }
    },
    
    // 加载用户信息
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo && userInfo.username) {
        this.userName = userInfo.username
      }
    },
    
    // 跳转到功能页面
    navigateToFunction(path) {
      if (path) {
        uni.navigateTo({
          url: path
        })
      } else {
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        })
      }
    },
    
    // 显示用户菜单
    showUserMenu() {
      uni.showActionSheet({
        itemList: ['个人资料', '修改密码', '关于我们'],
        success: (res) => {
          const actions = [
            () => uni.navigateTo({ url: '/pages/profile/profile' }),
            () => uni.navigateTo({ url: '/pages/index/change-password' }),
            () => uni.navigateTo({ url: '/pages/about/about' })
          ]
          if (actions[res.tapIndex]) {
            actions[res.tapIndex]()
          }
        }
      })
    }, 
    
    // 处理退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态
            uni.removeStorageSync('token')
            uni.removeStorageSync('isLoggedIn')
            uni.removeStorageSync('userInfo')
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            // 跳转到登录页
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/login/login'
              })
            }, 1000)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40rpx 30rpx;
} 

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60rpx;
}

.greeting {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-bottom: 100rpx;
}

.grid-item {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.grid-item:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.item-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 25rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}

.icon {
  width: 50rpx;
  height: 50rpx;
}

.item-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.item-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.bottom-actions {
  position: fixed;
  bottom: 60rpx;
  left: 30rpx;
  right: 30rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 50rpx;
  height: 80rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  gap: 15rpx;
}

.btn-icon {
  width: 36rpx;
  height: 36rpx;
}
</style>