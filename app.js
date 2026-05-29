// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    userPhone: null,
    baseUrl: 'http://127.0.0.1/tradex', // xtrade后端地址
    editItemId: null,
    editWishId: null,
    latitude: null,   // 全局纬度
    longitude: null,  // 全局经度
    locationDetails: null  // 位置详情（省市区和地址）
  },

  onLaunch() {
    this.checkLogin()
    this.initLocationCache()
  },

  // 初始化位置缓存（从 Storage 读取到 globalData）
  initLocationCache() {
    const cachedLocation = wx.getStorageSync('locationCache')
    if (cachedLocation) {
      this.globalData.latitude = cachedLocation.latitude
      this.globalData.longitude = cachedLocation.longitude
      this.globalData.locationDetails = cachedLocation.locationDetails || null
    }
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

      // 请求定位
      this.requestLocation({
        onSuccess: (location) => resolve(location),
        onFail: (err) => reject(err)
      })
    })
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
        const chooseName = res.name || ''
        const chooseAddress = res.address || ''
        that.reverseGeocodeAndSave(res.latitude, res.longitude, (locationDetails) => {
          locationDetails.name = chooseName
          locationDetails.address = chooseAddress || locationDetails.address || ''
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

  // 保存定位到缓存（同时保存到 globalData 和 Storage）
  saveLocationToCache({ latitude, longitude, locationDetails }) {
    this.globalData.latitude = latitude
    this.globalData.longitude = longitude
    if (locationDetails) {
      this.globalData.locationDetails = locationDetails
    }
    // 同步保存到 Storage，实现持久化
    wx.setStorageSync('locationCache', {
      latitude,
      longitude,
      locationDetails: locationDetails || null
    })
  },

  // 清除定位缓存（同时清除 globalData 和 Storage）
  clearLocation() {
    this.globalData.latitude = null
    this.globalData.longitude = null
    this.globalData.locationDetails = null
    wx.removeStorageSync('locationCache')
  }
})