// utils/format.js

/**
 * 格式化日期
 * @param {number|string} timestamp - 时间戳
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(timestamp, format = 'YYYY-MM-DD') {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化价格
 * @param {number|string} price - 价格
 * @param {string} currency - 货币符号，默认 '¥'
 * @returns {string} 格式化后的价格字符串
 */
export function formatPrice(price, currency = '¥') {
  if (price === undefined || price === null) return '';
  
  const numPrice = Number(price);
  if (isNaN(numPrice)) return '';
  
  return `${currency}${numPrice.toFixed(2)}`;
}

/**
 * 格式化数字（添加千分位）
 * @param {number|string} num - 数字
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '';
  
  const numStr = String(num);
  if (!/^\d+$/.test(numStr)) return numStr;
  
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化距离
 * @param {number} distance - 距离（单位：km）
 * @returns {object} { text, type } - 距离文本和类型
 */
export function formatDistance(distance) {
  if (distance === undefined || distance === null) {
    return { text: '', type: '' };
  }
  
  const numDistance = Number(distance);
  if (isNaN(numDistance)) {
    return { text: '', type: '' };
  }
  
  if (numDistance >= 100) {
    return { text: '非同城', type: 'remote' };
  } else if (numDistance < 1) {
    return { text: Math.round(numDistance * 1000) + 'm', type: 'near' };
  } else {
    return { text: numDistance + 'km', type: 'near' };
  }
}

/**
 * 格式化相对时间
 * @param {number|string} timestamp - 时间戳
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date().getTime();
  const diff = now - Number(timestamp);
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前';
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前';
  } else {
    return Math.floor(diff / year) + '年前';
  }
}
