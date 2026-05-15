// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    userPhone: null,
    baseUrl: 'http://192.168.152.16:80/tradex', // xtrade后端地址
    editItemId: null,
    editWishId: null,
    latitude: null,   // 全局纬度
    longitude: null   // 全局经度
  },

  onLaunch() {
    this.checkLogin()
    this.silentRefreshLocation()
  },

  checkLogin() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const userPhone = wx.getStorageSync('userPhone')
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.userPhone = userPhone
    }
  },

  getUserInfo(callback) {
    if (this.globalData.userInfo) {
      callback(this.globalData.userInfo)
    } else {
      wx.getUserProfile({
        desc: '获取你的昵称、头像等信息',
        success: (res) => {
          this.globalData.userInfo = res.userInfo
          wx.setStorageSync('userInfo', res.userInfo)
          callback(res.userInfo)
        },
        fail: () => {
          wx.showToast({ title: '需要授权才能继续', icon: 'none' })
        }
      })
    }
  },

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
      header['Authorization'] = `${token}`
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method || 'GET',
        data: options.data,
        header,
        success: (res) => {
          if (res.statusCode === 200) {
            const responseData = res.data
            if (responseData && responseData.success === true && responseData.data) {
              resolve(responseData.data)
            } else {
              resolve(responseData)
            }
          } else if (res.statusCode === 401) {
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
          wx.showToast({ title: '网络请求失败', icon: 'none' })
          reject(err)
        }
      })
    })
  },

  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true })
  },

  hideLoading() {
    wx.hideLoading()
  },

  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({ title, icon, duration })
  },

  // 获取定位（优先使用内存缓存）
  getLocation() {
    return new Promise((resolve, reject) => {
      // 如果已有缓存，直接返回
      if (this.hasCachedLocation()) {
        resolve(this.getCachedLocation())
        return
      }

      // 请求定位（自动处理权限）
      this.requestLocation({
        onSuccess: (location) => resolve(location),
        onFail: (err) => reject(err),
        showAuthModal: true
      })
    })
  },

  // 更新定位（强制刷新，清除缓存后重新获取）
  updateLocation() {
    this.clearLocation()
    return new Promise((resolve, reject) => {
      this.requestLocation({
        onSuccess: (location) => resolve(location),
        onFail: (err) => reject(err),
        showAuthModal: false
      })
    })
  },

  // 清除定位缓存
  clearLocation() {
    this.globalData.latitude = null
    this.globalData.longitude = null
  },

  // 检查是否有缓存的定位
  hasCachedLocation() {
    return this.globalData.latitude !== null && this.globalData.longitude !== null
  },

  // 获取缓存的定位
  getCachedLocation() {
    return {
      latitude: this.globalData.latitude,
      longitude: this.globalData.longitude
    }
  },

  // 请求定位（统一处理权限检查和定位获取）
  requestLocation({ onSuccess, onFail, showAuthModal = true }) {
    this.checkLocationPermission({
      onGranted: () => {
        this.fetchLocation({ onSuccess, onFail })
      },
      onDenied: () => {
        if (showAuthModal) {
          this.showLocationAuthModal({ onGranted: onSuccess, onDenied: onFail })
        } else {
          onFail(new Error('未获取定位权限'))
        }
      },
      onError: (err) => {
        onFail(err)
      }
    })
  },

  // 检查定位权限
  checkLocationPermission({ onGranted, onDenied, onError }) {
    wx.getSetting({
      success: (res) => {
        const status = res.authSetting['scope.userLocation']
        if (status === true) {
          onGranted()
        } else if (status === false) {
          onDenied()  // 已拒绝，显示"去设置"弹窗
        } else {
          // 从未请求过，直接调用 wx.getLocation() 触发系统授权
          this.fetchLocation({ onSuccess: onGranted, onFail: onDenied })
        }
      },
      fail: () => {
        onError(new Error('获取设置失败'))
      }
    })
  },

  // 显示定位授权弹窗
  showLocationAuthModal({ onGranted, onDenied }) {
    wx.showModal({
      title: '需要定位权限',
      content: '为了给您提供更精准的服务，请允许获取您的位置信息',
      confirmText: '去设置',
      confirmColor: '#52c41a',
      success: (modalRes) => {
        if (modalRes.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting['scope.userLocation']) {
                this.fetchLocation({ onSuccess: onGranted, onFail: onDenied })
              } else {
                onDenied(new Error('用户拒绝定位授权'))
              }
            },
            fail: () => {
              onDenied(new Error('打开设置失败'))
            }
          })
        } else {
          onDenied(new Error('用户拒绝定位授权'))
        }
      }
    })
  },

  // 获取定位（底层方法）
  fetchLocation({ onSuccess, onFail }) {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = { latitude: res.latitude, longitude: res.longitude }
        this.saveLocationToCache(location)
        onSuccess(location)
      },
      fail: (err) => {
        onFail(err)
      }
    })
  },

  // 保存定位到缓存
  saveLocationToCache({ latitude, longitude }) {
    this.globalData.latitude = latitude
    this.globalData.longitude = longitude
  },

  // 静默刷新定位（小程序启动时调用）
  silentRefreshLocation() {
    this.checkLocationPermission({
      onGranted: () => {
        wx.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.saveLocationToCache({ latitude: res.latitude, longitude: res.longitude })
            console.log('定位静默刷新成功:', res.latitude, res.longitude)
          },
          fail: (err) => {
            console.log('定位静默刷新失败:', err.message)
          }
        })
      },
      onDenied: () => {
        // 未授权，不做任何操作
      },
      onError: () => {
        console.log('获取定位权限设置失败')
      }
    })
  }
})