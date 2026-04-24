// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'https://api.example.com', // 需要替换为实际的 API 地址
    editItemId: null,
    editWishId: null
  },

  onLaunch() {
    // 检查用户登录状态
    this.checkLogin()
  },

  checkLogin() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    }
  },

  // 获取用户信息
  getUserInfo(callback) {
    if (this.globalData.userInfo) {
      callback(this.globalData.userInfo)
    } else {
      // 需要用户授权
      wx.getUserProfile({
        desc: '获取你的昵称、头像等信息',
        success: (res) => {
          this.globalData.userInfo = res.userInfo
          wx.setStorageSync('userInfo', res.userInfo)
          callback(res.userInfo)
        },
        fail: () => {
          wx.showToast({
            title: '需要授权才能继续',
            icon: 'none'
          })
        }
      })
    }
  },

  // 发送 API 请求
  request(options) {
    const token = this.globalData.token
    const url = options.url.startsWith('http') 
      ? options.url 
      : this.globalData.baseUrl + options.url

    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method || 'GET',
        data: options.data,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // 未授权，清除登录信息
            this.globalData.token = null
            this.globalData.userInfo = null
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            wx.reLaunch({ url: '/pages/login/login' })
            reject(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading()
  },

  // 显示提示信息
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration
    })
  }
})
