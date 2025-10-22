<template>
  <view class="profile-container">
    <!-- 第一行：头像和昵称 -->
    <view class="profile-header">
      <view class="avatar-section">
        <!-- 头像圆形框 -->
        <view class="avatar-wrapper" @click="changeAvatar">
          <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
          <view class="gender-tag" :class="userInfo.gender">
            <image class="gender-icon" :src="userInfo.gender === 'male' ? '/static/icon_profile/male.png' : '/static/icon_profile/female.png'"></image>
          </view>
        </view>
        <!-- 昵称和编辑 -->
        <view class="name-section">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <view class="edit-btn" @click="editNickname">
            <image class="edit-icon" src="/static/icon_profile/edit.png"></image>
            <text>编辑</text>
          </view>
        </view>
        <text class="username">用户名: {{ userInfo.username }}</text>
      </view>
    </view>

    <!-- 第二行：手机号 -->
    <view class="info-card">
      <view class="card-item" @click="changePhone">
        <view class="item-left">
          <image class="item-icon" src="/static/icon_profie/phone.png"></image>
          <view class="item-info">
            <text class="item-label">手机号</text>
            <text class="item-value">{{ userInfo.phone }}</text>
          </view>
        </view>
        <image class="arrow" src="/static/icon_profile/arrow-right.png"></image>
      </view>
    </view>

    <!-- 第三行：绑定设备 -->
    <view class="info-card">
      <view class="card-item" @click="navigateToBindDevice">
        <view class="item-left">
          <image class="item-icon" src="/static/icon_profile/device.png"></image>
          <view class="item-info">
            <text class="item-label">绑定设备</text>
            <text class="item-desc">已绑定 {{ userInfo.boundDevices }} 个设备</text>
          </view>
        </view>
        <image class="arrow" src="/static/icon_profile/arrow-right.png"></image>
      </view>
    </view>

    <!-- 第四行：问题反馈 -->
    <view class="info-card">
      <view class="card-item" @click="navigateToFeedback">
        <view class="item-left">
          <image class="item-icon" src="/static/icon_profile/feedback.png"></image>
          <view class="item-info">
            <text class="item-label">问题反馈</text>
            <text class="item-desc">向我们提出建议或问题</text>
          </view>
        </view>
        <image class="arrow" src="/static/icon_profile/arrow-right.png"></image>
      </view>
    </view>

    <!-- 第五行：关于我们 -->
    <view class="info-card">
      <view class="card-item" @click="navigateToAbout">
        <view class="item-left">
          <image class="item-icon" src="/static/icon_profile/about.png"></image>
          <view class="item-info">
            <text class="item-label">关于我们</text>
            <text class="item-desc">了解产品信息</text>
          </view>
        </view>
        <image class="arrow" src="/static/icon_profile/arrow-right.png"></image>
      </view>
    </view>

    <!-- 第六行：退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        <image class="logout-icon" src="/static/icon_profile/logout.png"></image>
        <text>退出登录</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        avatar: '/static/icion_profile/default-avatar.png',
        nickname: '智能设备用户',
        username: 'smartuser001',
        gender: 'male', // male: 男, female: 女
        phone: '138****8888',
        boundDevices: 3
      }
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      // 从本地存储加载用户信息
      const savedUserInfo = uni.getStorageSync('userInfo')
      if (savedUserInfo) {
        this.userInfo = { ...this.userInfo, ...savedUserInfo }
      }
    },

    // 更换头像
    changeAvatar() {
      uni.showActionSheet({
        itemList: ['拍照', '从相册选择', '查看大图'],
        success: (res) => {
          const actions = [
            this.takePhoto,
            this.chooseImage,
            this.previewAvatar
          ]
          if (actions[res.tapIndex]) {
            actions[res.tapIndex]()
          }
        }
      })
    },

    // 拍照
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0]
          this.saveUserInfo()
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        }
      })
    },

    // 从相册选择
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: (res) => {
          this.userInfo.avatar = res.tempFilePaths[0]
          this.saveUserInfo()
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        }
      })
    },

    // 预览头像
    previewAvatar() {
      uni.previewImage({
        urls: [this.userInfo.avatar],
        current: 0
      })
    },

    // 编辑昵称
    editNickname() {
      uni.showModal({
        title: '修改昵称',
        content: '请输入新的昵称',
        editable: true,
        placeholderText: this.userInfo.nickname,
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.nickname = res.content
            this.saveUserInfo()
            uni.showToast({
              title: '昵称修改成功',
              icon: 'success'
            })
          }
        }
      })
    },

    // 更换手机号
    changePhone() {
      uni.showModal({
        title: '更换手机号',
        content: '该功能需要验证原手机号',
        confirmText: '立即更换',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/profile/change-phone'
            })
          }
        }
      })
    },

    // 跳转到绑定设备页面
    navigateToBindDevice() {
      uni.navigateTo({
        url: '/pages/profile/bind-device'
      })
    },

    // 跳转到问题反馈页面
    navigateToFeedback() {
      uni.navigateTo({
        url: '/pages/profile/feedback'
      })
    },

    // 跳转到关于我们页面
    navigateToAbout() {
      uni.navigateTo({
        url: '/pages/profile/about'
      })
    },

    // 处理退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            this.logout()
          }
        }
      })
    },

    // 执行退出登录
    logout() {
      uni.showLoading({
        title: '退出中...'
      })

      // 模拟退出操作
      setTimeout(() => {
        // 清除登录状态
        uni.removeStorageSync('token')
        uni.removeStorageSync('isLoggedIn')
        uni.removeStorageSync('userInfo')

        uni.hideLoading()

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })

        // 跳转到登录页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
      }, 1000)
    },

    // 保存用户信息
    saveUserInfo() {
      uni.setStorageSync('userInfo', this.userInfo)
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 30rpx 60rpx;
}

/* 第一行：头像和昵称 */
.profile-header {
  padding: 80rpx 0 60rpx;
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  background: #fff;
}

.gender-tag {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
}

.gender-tag.male {
  background: #1890ff;
}

.gender-tag.female {
  background: #ff4d94;
}

.gender-icon {
  width: 24rpx;
  height: 24rpx;
}

.name-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.edit-icon {
  width: 24rpx;
  height: 24rpx;
}

.username {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 信息卡片样式 */
.info-card {
  background: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
}

.card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  background: white;
  transition: all 0.2s;
}

.card-item:active {
  background: #f8f9fa;
  transform: scale(0.99);
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: 24rpx;
}

.item-info {
  flex: 1;
}

.item-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.item-value {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.item-desc {
  display: block;
  font-size: 26rpx;
  color: #999;
}

.arrow {
  width: 32rpx;
  height: 32rpx;
  margin-left: 20rpx;
}

/* 退出登录按钮 */
.logout-section {
  margin-top: 60rpx;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #ff4757;
  border: none;
  border-radius: 50rpx;
  height: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.logout-btn:active {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(0.98);
}

.logout-icon {
  width: 36rpx;
  height: 36rpx;
}
</style>