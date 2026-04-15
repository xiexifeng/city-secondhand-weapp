// utils/helpers.js

/**
 * 格式化价格
 */
function formatPrice(price) {
  if (!price) return '¥0'
  return `¥${parseFloat(price).toFixed(2)}`
}

/**
 * 格式化日期
 */
function formatDate(timestamp, format = 'YYYY-MM-DD HH:mm') {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 计算距离（km）
 */
function formatDistance(meters) {
  if (!meters) return '未知'
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 相对时间
 */
function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return formatDate(timestamp, 'YYYY-MM-DD')
}

/**
 * 验证手机号
 */
function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证身份证
 */
function isValidIdCard(idCard) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 */
function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 获取查询参数
 */
function getQueryParam(url, param) {
  const regex = new RegExp('[?&]' + param + '=([^&#]*)')
  const results = regex.exec(url)
  return results === null ? '' : decodeURIComponent(results[1])
}

/**
 * 生成 UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 检查权限
 */
function checkPermission(permission) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting[permission]) {
          resolve(true)
        } else {
          reject(false)
        }
      },
      fail: () => reject(false)
    })
  })
}

/**
 * 请求权限
 */
function requestPermission(permission) {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: permission,
      success: () => resolve(true),
      fail: () => reject(false)
    })
  })
}

module.exports = {
  formatPrice,
  formatDate,
  formatDistance,
  formatRelativeTime,
  isValidPhone,
  isValidEmail,
  isValidIdCard,
  debounce,
  throttle,
  deepClone,
  getQueryParam,
  generateUUID,
  checkPermission,
  requestPermission
}
