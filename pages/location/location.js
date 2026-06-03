// pages/location/location.js
import { TENCENT_MAP_KEY } from '../../config';
const app = getApp()

Page({
  data: {
    longitude: 116.397428,
    latitude: 39.90923,
    currentName: '',
    currentAddress: '北京市朝阳区',
    locationDetails: {
      province: '北京市',
      city: '北京市',
      district: '朝阳区'
    },
    region: ['北京市', '北京市', '朝阳区'],
    nearbyPOIs: []
  },

  onLoad: function(options) {
    this.loadCachedLocation();
  },

  /**
   * 加载缓存的定位
   */
  loadCachedLocation() {
    const cachedLocation = app.getCachedLocation();
    const cachedDetails = app.globalData.locationDetails || {};
    if (cachedLocation.latitude !== null) {
      this.setData({ 
        longitude: cachedLocation.longitude, 
        latitude: cachedLocation.latitude,
        currentName: cachedDetails.name || ''
      });
      this.reverseGeocode(cachedLocation.latitude, cachedLocation.longitude);
    }
  },

  /**
   * 逆地理编码，根据经纬度获取地址信息和周边 POI
   */
  reverseGeocode: function(latitude, longitude) {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${TENCENT_MAP_KEY}&get_poi=1&poi_options=policy=1;radius=2000;page_size=50;page_index=1`,
      success: (res) => {
        if (res.data.status === 0 && res.data.result) {
          const address = res.data.result;
          // 确保 ad_info 存在
          const adInfo = address.ad_info || {};
          const province = adInfo.province || '';
          const city = adInfo.city || '';
          const district = adInfo.district || '';
          
          // 获取周边 POI，最多显示 10 个
          const pois = address.pois || [];
          const limitedPOIs = pois.slice(0, 10);
          console.log('周边 POI 数量:', pois.length);
          console.log('显示的 POI 数量:', limitedPOIs.length);
          
          // 更新位置详情
          this.setData({
            currentAddress: address.address || '',
            locationDetails: {
              province: province,
              city: city,
              district: district
            },
            region: [province, city, district],
            nearbyPOIs: limitedPOIs
          });
        } else {
          console.error('逆地理编码返回数据异常:', res.data);
        }
      },
      fail: (err) => {
        console.error('逆地理编码失败:', err);
      }
    });
  },

  /**
   * 地图区域变化事件
   */
  onRegionChange: function(e) {
    // 只有在结束拖动时才获取位置信息，避免频繁调用API
    if (e.type === 'end') {
      const { longitude, latitude } = e.detail.centerLocation;
      this.reverseGeocode(latitude, longitude);
    }
  },

  /**
   * 定位到当前位置（使用 chooseLocation）
   */
  locateToCurrent: async function() {
    try {
      wx.showLoading({ title: '获取位置...', mask: true })
      const { latitude, longitude } = await app.getLocation()
      wx.hideLoading()
      this.setData({ longitude, latitude })
      this.reverseGeocode(latitude, longitude)
    } catch (err) {
      wx.hideLoading()
      console.error('获取位置失败:', err.message)
      wx.showToast({ title: '获取位置失败', icon: 'none' })
    }
  },

  /**
   * 省市区选择变化
   */
  onRegionPickerChange: function(e) {
    const region = e.detail.value;
    const [province, city, district] = region;
    
    // 过滤无效的省市区名称
    const validProvince = province && province !== '中国区域' ? province : '';
    const validCity = city && city !== '中国区域' ? city : '';
    const validDistrict = district && district !== '中国区域' ? district : '';
    
    // 更新位置详情
    this.setData({
      region: [validProvince, validCity, validDistrict],
      locationDetails: {
        province: validProvince,
        city: validCity,
        district: validDistrict
      }
    });
    
    // 更新详细地址
    const address = `${validProvince}${validCity}${validDistrict}`;
    this.setData({ currentAddress: address || '请选择地址' });
    
    // 将省市区转换为经纬度，并更新地图位置
    if (address) {
      this.forwardGeocode(address);
    }
  },

  /**
   * 正向地理编码，将地址转换为经纬度
   */
  forwardGeocode: function(address) {
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${TENCENT_MAP_KEY}`,
      success: (res) => {
        if (res.data.status === 0) {
          const location = res.data.result.location;
          this.setData({
            longitude: location.lng,
            latitude: location.lat
          });
        }
      },
      fail: (err) => {
        console.error('正向地理编码失败:', err);
      }
    });
  },

  /**
   * 选择周边地点
   */
  selectPOI: function(e) {
    const poi = e.currentTarget.dataset.poi;
    if (poi) {
      this.setData({
        currentName: poi.title || '',
        currentAddress: poi.address || '',
        locationDetails: {
          province: poi.province || this.data.locationDetails.province,
          city: poi.city || this.data.locationDetails.city,
          district: poi.district || this.data.locationDetails.district
        }
      });
    }
  },

  /**
   * 更新详细地址
   */
  updateAddress: function(e) {
    this.setData({ currentAddress: e.detail.value });
  },

  /**
   * 确认选择位置
   */
  confirmLocation: function() {
    const { currentName, currentAddress, locationDetails, latitude, longitude } = this.data;
    const app = getApp();
    const cacheDetails = {
      province: locationDetails.province || '',
      city: locationDetails.city || '',
      district: locationDetails.district || '',
      name: currentName || '',
      address: currentAddress || ''
    };
    app.saveLocationToCache({ latitude, longitude, locationDetails: cacheDetails });
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.setData({
      'formData.location': currentAddress,
      locationDetails: {
        province: locationDetails.province || '',
        city: locationDetails.city || '',
        district: locationDetails.district || '',
        name: currentName || '',
        address: currentAddress || ''
      },
      'formData.latitude': latitude,
      'formData.longitude': longitude
    });
    wx.navigateBack();
  },

  /**
   * 返回上一页
   */
  handleBack: function() {
    wx.navigateBack();
  }
});