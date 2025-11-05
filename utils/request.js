// utils/request.js
import { md5 } from './md5.js';

const BASE_URL ='http://localhost:8888/api';

let token = uni.getStorageSync('jwt_token') || '';

export const setToken = (newToken) => {
  token = newToken;
  uni.setStorageSync('jwt_token', newToken);
};

export const getToken = () => {
  return token;
};

export const clearToken = () => { 
  token = '';
  uni.removeStorageSync('jwt_token');
  uni.removeStorageSync('userData');
  uni.removeStorageSync('isLoggedIn');
};

// 封装的 request 方法
export const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, header = {} } = options;
    
    // 自动添加 Authorization 头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
    
    // 设置内容类型
    if (!header['Content-Type'] && method !== 'GET') {
      header['Content-Type'] = 'application/json';
    }
    
    // 构建完整的URL
    const fullUrl = `${BASE_URL}${url}`;
    console.log(`请求: ${method} ${fullUrl}`, data);
    
    uni.request({
      url: fullUrl,
      method: method.toUpperCase(),
      data: data,
      header: header,
      success: (res) => {
        console.log(`响应状态: ${res.statusCode}`, res.data);
        
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          const error = new Error(res.data?.message || `请求失败: ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.data = res.data;
          reject(error);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        const error = new Error(`网络请求失败: ${err.errMsg}`);
        error.originalError = err;
        reject(error);
      }
    });
  });
};

// 登录方法 - 使用 MD5 加密密码
export const login = (username, password) => {
  const encryptedPassword = md5(password);
  console.log('MD5加密验证:', {
    '原始密码': password,
    '加密结果': encryptedPassword,
    '期望结果': 'e10adc3949ba59abbe56e057f20f883e',
    '是否匹配': encryptedPassword === 'e10adc3949ba59abbe56e057f20f883e'
  });
  
    return request({
    url: '/auth',  // 对应后端的 auth 接口
    method: 'POST',
    data: { 
      username: username.trim(),
      password: encryptedPassword 
    }
  });
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return request({
    url: '/me',  // 对应后端的 me 接口
    method: 'GET'
  });
};

// 退出登录
export const logout = async () => {
  try {
    await request({
      url: '/logout',  // 对应后端的 logout 接口
      method: 'GET'
    });
  } finally {
    // 无论接口调用成功与否，都清除本地token
    clearToken();
  }
};
// 便捷方法
export const get = (url, data = {}) => {
  return request({ url, method: 'GET', data });
};

export const post = (url, data = {}) => {
  return request({ url, method: 'POST', data });
};

export const put = (url, data = {}) => {
  return request({ url, method: 'PUT', data });
};

export const del = (url, data = {}) => {
  return request({ url, method: 'DELETE', data });
};

// 获取用户所属的组织列表
export const getMyGroups = () => {
  return request({
    url: '/member/my-groups',
    method: 'GET'
  });
};

// 获取指定组织的设备列表
export const getGroupDevices = (groupId, params = {}) => {
  return request({
    url: `/device/group/${groupId}`,
    method: 'GET',
    data: params
  });
};

// 获取默认组织的设备（第一个组织）
export const getDefaultGroupDevices = (params = {}) => {
  return request({
    url: '/device/my-default',
    method: 'GET',
    data: params
  });
};