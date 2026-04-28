// utils/api.js
const app = getApp()

/**
 * 发送 API 请求
 * @param {string} url - 请求 URL
 * @param {object} options - 请求选项
 */
function request(url, options = {}) {
  const {
    method = 'GET',
    data = null,
    header = {},
    timeout = 10000
  } = options

  return new Promise((resolve, reject) => {
    const requestUrl = url.startsWith('http') ? url : app.globalData.baseUrl + url
    const token = app.globalData.token || wx.getStorageSync('token')

    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }

    if (token) {
      requestHeader['Authorization'] = token
    }

    wx.request({
      url: requestUrl,
      method,
      data,
      header: requestHeader,
      timeout,
      success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            // 返回完整的响应对象，包括success、code、desc、data字段
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // 未授权
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            app.globalData.token = null
            app.globalData.userInfo = null
            wx.reLaunch({ url: '/pages/login/login' })
            reject({ message: '请重新登录' })
          } else {
            reject(res.data || { message: '请求失败' })
          }
        },
      fail: (err) => {
        reject({ message: '网络请求失败', error: err })
      }
    })
  })
}

// 物品相关 API
const itemAPI = {
  // 获取物品列表
  getItems(params) {
    return request('/client/square/list-item', {
      method: 'POST',
      data: params
    })
  },

  // 获取物品详情
  getItemDetail(itemId) {
    return request(`/client/square/detail-item/${itemId}`, {
      method: 'POST'
    })
  },

  // 发布物品
  publishItem(data) {
    return request('/client/item/publish', {
      method: 'POST',
      data
    })
  },

  // 更新物品
  updateItem(itemId, data) {
    return request(`/client/item/update/${itemId}`, {
      method: 'POST',
      data
    })
  },

  // 删除物品
  deleteItem(itemId) {
    return request(`/client/item/delete/${itemId}`, {
      method: 'POST'
    })
  },

  // 获取我的物品列表
  getMyItems(params) {
    return request('/client/item/list-mine', {
      method: 'POST',
      data: params
    })
  },

  // 更新物品转让状态
  updateTransferStatus(itemId, transferStatus) {
    return request('/client/item/transfer-status', {
      method: 'POST',
      data: { itemId, transferStatus }
    })
  },

  // 获取我的物品详情
  getMyItemDetail(itemId) {
    return request(`/client/item/detail/${itemId}`, {
      method: 'POST'
    })
  }
}

// 用户相关 API
const userAPI = {
  // 发送短信验证码
  sendSms(phoneNumbers) {
    return request('/client/auth/send-sms?phoneNumbers=' + phoneNumbers, {
      method: 'POST'
    })
  },

  // 登录或注册-手机号+验证码
  loginOrRegister(phoneNumbers, verifyCode) {
    return request('/client/auth/login-or-register?phoneNumbers=' + phoneNumbers + '&verifyCode=' + verifyCode, {
      method: 'POST'
    })
  },

  // 登录-手机号+密码
  loginByPassword(phoneNumbers, password) {
    return request('/client/auth/login-by-password?phoneNumbers=' + phoneNumbers + '&password=' + password, {
      method: 'POST'
    })
  },

  // 获取用户信息
  getUserInfo() {
    return request('/client/user/get', {
      method: 'GET'
    })
  },

  // 更新用户信息
  updateUserInfo(data) {
    return request('/client/user/update', {
      method: 'POST',
      data
    })
  },

  // 获取用户发布的物品
  getUserItems(userId) {
    return request(`/client/item/my-list`, {
      method: 'GET'
    })
  }
}

// 消息相关 API
const messageAPI = {
  // 获取消息列表
  getMessages(params) {
    return request('/api/messages', {
      method: 'GET',
      data: params
    })
  },

  // 发送消息
  sendMessage(data) {
    return request('/api/messages', {
      method: 'POST',
      data
    })
  },

  // 获取消息详情
  getMessageDetail(messageId) {
    return request(`/api/messages/${messageId}`, {
      method: 'GET'
    })
  }
}

// 求换墙相关 API
const wishAPI = {
  // 获取求换墙列表
  getWishes(params) {
    return request('/client/wish/list', {
      method: 'POST',
      data: params
    })
  },

  // 获取我的求换列表
  getMyWishes(params) {
    return request('/client/wish/list-mine', {
      method: 'POST',
      data: params
    })
  },

  // 发布求换
  publishWish(data) {
    return request('/client/wish/publish', {
      method: 'POST',
      data
    })
  },

  // 更新求换
  updateWish(wishId, data) {
    return request(`/client/wish/update/${wishId}`, {
      method: 'POST',
      data
    })
  },

  // 获取求换详情
  getWishDetail(wishId) {
    return request(`/client/wish/get-detail/${wishId}`, {
      method: 'POST'
    })
  },

  // 获取我的求换详情
  getMyWishDetail(wishId) {
    return request(`/client/wish/detail/${wishId}`, {
      method: 'POST'
    })
  },

  // 删除求换
  deleteWish(wishId) {
    return request(`/client/wish/delete/${wishId}`, {
      method: 'POST'
    })
  },

  // 更新心愿状态
  updateWishStatus(wishId, status) {
    return request(`/client/wish/status/${wishId}?status=${status}`, {
      method: 'POST'
    })
  },

  // 点赞求换
  likeWish(wishId) {
    return request(`/client/wish/like/${wishId}`, {
      method: 'POST'
    })
  },

  // 收藏求换
  collectWish(wishId) {
    return request(`/client/wish/collect/${wishId}`, {
      method: 'POST'
    })
  }
}

// 文件上传相关
const fileAPI = {
  // 上传图片
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      
      wx.uploadFile({
        url: app.globalData.baseUrl + '/basic/oss/uploadFile',
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            // 后端返回JSON格式响应
            const data = JSON.parse(res.data);
            if (data.success) {
              resolve({ data: { fileUrl: data.data } });
            } else {
              reject({ message: data.desc || '上传失败' });
            }
          } else {
            reject({ message: '上传失败', error: res.data });
          }
        },
        fail: (err) => {
          reject({ message: '上传失败', error: err })
        }
      })
    })
  }
}

module.exports = {
  request,
  itemAPI,
  userAPI,
  messageAPI,
  wishAPI,
  fileAPI
}
