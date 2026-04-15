/**
 * 高德地图工具类
 * 用于处理高德地图相关的功能
 */

const AMAP_KEY = 'b13e53dc91bbba9aafb447accfbcb85f';

/**
 * 加载高德地图SDK
 */
function loadAmapSDK() {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.AMap) {
      resolve(window.AMap);
      return;
    }

    // 创建script标签加载高德地图
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geocoder`;
    script.onload = () => {
      resolve(window.AMap);
    };
    script.onerror = () => {
      reject(new Error('Failed to load AMap SDK'));
    };
    document.head.appendChild(script);
  });
}

/**
 * 获取静态地图图片URL
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @param {number} zoom - 缩放级别（1-18）
 * @param {number} width - 图片宽度（像素）
 * @param {number} height - 图片高度（像素）
 * @returns {string} 地图图片URL
 */
function getStaticMapUrl(longitude, latitude, zoom = 15, width = 600, height = 300) {
  // 高德地图静态图API
  // 参数说明：
  // location: 经度,纬度
  // zoom: 缩放级别(1-18)
  // size: 宽x高(像素)
  // key: API密钥
  // markers: 标记点 格式: mid,,0:经度,纬度
  const url = `https://restapi.amap.com/v3/staticmap?location=${longitude},${latitude}&zoom=${zoom}&size=${width}x${height}&key=${AMAP_KEY}&markers=mid,,0:${longitude},${latitude}`;
  return url;
}

/**
 * 地址转坐标（地理编码）
 * @param {string} address - 地址
 * @returns {Promise} 返回经纬度信息
 */
function geocode(address) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/geo',
      data: {
        address: address,
        key: AMAP_KEY,
        city: '北京'
      },
      success: (res) => {
        if (res.data.status === '1' && res.data.geocodes.length > 0) {
          const location = res.data.geocodes[0].location.split(',');
          resolve({
            longitude: parseFloat(location[0]),
            latitude: parseFloat(location[1]),
            address: res.data.geocodes[0].formatted_address
          });
        } else {
          reject(new Error('Geocoding failed'));
        }
      },
      fail: reject
    });
  });
}

/**
 * 坐标转地址（反地理编码）
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @returns {Promise} 返回地址信息
 */
function regeocode(longitude, latitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/regeo',
      data: {
        location: `${longitude},${latitude}`,
        key: AMAP_KEY,
        extensions: 'all'
      },
      success: (res) => {
        if (res.data.status === '1') {
          resolve({
            address: res.data.regeocode.formatted_address,
            province: res.data.regeocode.addressComponent.province,
            city: res.data.regeocode.addressComponent.city,
            district: res.data.regeocode.addressComponent.district
          });
        } else {
          reject(new Error('Reverse geocoding failed'));
        }
      },
      fail: reject
    });
  });
}

/**
 * 获取周边POI
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @param {number} radius - 搜索半径（米）
 * @param {string} keyword - 搜索关键词
 * @returns {Promise} 返回POI列表
 */
function searchNearby(longitude, latitude, radius = 1000, keyword = '地铁站') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://restapi.amap.com/v3/place/around',
      data: {
        location: `${longitude},${latitude}`,
        radius: radius,
        keywords: keyword,
        key: AMAP_KEY,
        offset: 10
      },
      success: (res) => {
        if (res.data.status === '1') {
          resolve(res.data.pois);
        } else {
          reject(new Error('Search nearby failed'));
        }
      },
      fail: reject
    });
  });
}

/**
 * 获取两点间的距离
 * @param {number} startLng - 起点经度
 * @param {number} startLat - 起点纬度
 * @param {number} endLng - 终点经度
 * @param {number} endLat - 终点纬度
 * @returns {Promise} 返回距离（米）
 */
function getDistance(startLng, startLat, endLng, endLat) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://restapi.amap.com/v3/distance',
      data: {
        origins: `${startLng},${startLat}`,
        destination: `${endLng},${endLat}`,
        type: 0,
        key: AMAP_KEY
      },
      success: (res) => {
        if (res.data.status === '1') {
          const distance = res.data.results[0].distance;
          resolve(distance);
        } else {
          reject(new Error('Get distance failed'));
        }
      },
      fail: reject
    });
  });
}

module.exports = {
  AMAP_KEY,
  loadAmapSDK,
  getStaticMapUrl,
  geocode,
  regeocode,
  searchNearby,
  getDistance
};
