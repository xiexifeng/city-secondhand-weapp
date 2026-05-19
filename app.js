// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    userPhone: null,
    baseUrl: 'https://139.196.178.113/tradex', // xtrade后端地址
    editItemId: null,
    editWishId: null,
    latitude: null,   // 全局纬度
    longitude: null,  // 全局经度
    locationDetails: null  // 位置详情（省市区和地址）
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

  // 请求定位（使用 chooseLocation，无需权限）
  requestLocation({ onSuccess, onFail, showAuthModal = true }) {
    const that = this
    wx.chooseLocation({
      success: (res) => {
        const location = { latitude: res.latitude, longitude: res.longitude }
        that.reverseGeocodeAndSave(res.latitude, res.longitude, (locationDetails) => {
          that.saveLocationToCache({ ...location, locationDetails })
          onSuccess({ ...location, locationDetails })
        })
      },
      fail: (err) => {
        const error = err instanceof Error ? err : new Error(err.message || err.errMsg || '获取位置失败')
        onFail(error)
      }
    })
  },

  // 检查定位权限（简化，因为 chooseLocation 不需要权限）
  checkLocationPermission({ onGranted, onDenied, onError }) {
    onGranted()
  },

  // 显示定位授权弹窗（保留但不再使用）
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

  // 获取定位（底层方法，使用 chooseLocation）
  fetchLocation({ onSuccess, onFail }) {
    const that = this
    wx.chooseLocation({
      success: (res) => {
        const location = { latitude: res.latitude, longitude: res.longitude }
        that.reverseGeocodeAndSave(res.latitude, res.longitude, (locationDetails) => {
          that.saveLocationToCache({ ...location, locationDetails })
          onSuccess({ ...location, locationDetails })
        })
      },
      fail: (err) => {
        const error = err instanceof Error ? err : new Error(err.message || err.errMsg || '获取位置失败')
        onFail(error)
      }
    })
  },

  // 逆地理编码并保存位置详情
  reverseGeocodeAndSave(latitude, longitude, callback) {
    const { TENCENT_MAP_KEY } = require('./config.js')
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${TENCENT_MAP_KEY}`,
      success: (res) => {
        if (res.data.status === 0 && res.data.result) {
          const address = res.data.result
          const adInfo = address.ad_info || {}
          const locationDetails = {
            province: adInfo.province || '',
            city: adInfo.city || '',
            district: adInfo.district || '',
            address: address.address || ''
          }
          callback(locationDetails)
        } else {
          callback({})
        }
      },
      fail: () => {
        callback({})
      }
    })
  },

  // 保存定位到缓存
  saveLocationToCache({ latitude, longitude, locationDetails }) {
    this.globalData.latitude = latitude
    this.globalData.longitude = longitude
    if (locationDetails) {
      this.globalData.locationDetails = locationDetails
    }
  },

  // 清除定位缓存
  clearLocation() {
    this.globalData.latitude = null
    this.globalData.longitude = null
    this.globalData.locationDetails = null
  },

  // 静默刷新定位（小程序启动时调用，改为不自动获取）
  silentRefreshLocation() {
    console.log('静默刷新已禁用，定位将在需要时由用户手动选择')
  }
})