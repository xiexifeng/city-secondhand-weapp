// pages/wish-detail/wish-detail.js
const { wishWallAPI } = require('../../utils/api.js')
const { formatRelativeTime, formatDistance } = require('../../utils/format.js')
const app = getApp()

Page({
  data: {
    wish: null,
    showReportModal: false,
    showSafetyDetails: false,
    isLoggedIn: true,
    markers: [],
    liked: false,
    collected: false,
    latitude: null,
    longitude: null
  },

  onLoad: function(options) {
    const wishId = options.id;
    this.getLocationAndLoadWishDetail(wishId);
  },

  async getLocationAndLoadWishDetail(wishId) {
    try {
      const { latitude, longitude } = await app.getLocation()
      this.setData({ latitude, longitude })
    } catch (err) {
      console.log('获取定位失败:', err.message)
    } finally {
      this.loadWishDetail(wishId)
    }
  },

  loadWishDetail: function(wishId) {
    wx.showLoading({ title: '加载中...' });
    
    const params = {};
    if (this.data.latitude && this.data.longitude) {
      params.latitude = this.data.latitude;
      params.longitude = this.data.longitude;
    }
    
    wishWallAPI.getWishDetail(wishId, params).then(wishData => {
        const wish = this.transformWishData(wishData);
        if (wish && wish.id) {
          const markers = [{
            id: 0,
            latitude: wish.location?.latitude || 0,
            longitude: wish.location?.longitude || 0,
            title: wish.title,
            width: 30,
            height: 30
          }];
          
          this.setData({ 
            wish: wish,
            markers: markers,
            liked: wishData.liked || false,
            collected: wishData.collected || false
          });
        } else {
          wx.showToast({
            title: '心愿不存在',
            icon: 'error',
            duration: 2000
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      }).catch(() => {
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      }).finally(() => {
        wx.hideLoading();
      });
  },

  transformWishData: function(data) {
    const distanceResult = formatDistance(data.distance);
    let locationInfo = {};
    try {
      locationInfo = JSON.parse(data.location || '{}');
    } catch (e) {
      locationInfo = { location: data.location };
    }
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget,
      distance: data.distance,
      formattedDistance: distanceResult.text,
      distanceType: distanceResult.type,
      formattedTime: formatRelativeTime(data.time),
      userName: data.userName,
      verified: data.verified,
      active: data.active,
      contact: { wechat: data.wechat || '', phone: data.phone || '' },
      location: {address: locationInfo.location, latitude: data.latitude, longitude: data.longitude},
      stats: { views: data.views || 0, likes: data.likes || 0, favorites: data.favorites || 0 },
      liked: data.liked || false,
      collected: data.collected || false,
      images: data.images || []
    };
  },

  goBack: function() {
    wx.navigateBack();
  },

  handleShare: function() {
    wx.showShareMenu({
      withShareTicket: false,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    wx.showToast({
      title: '请点击右上角进行分享',
      icon: 'none',
      duration: 1600
    });
  },

  handleReport: function() {
    this.setData({ showReportModal: true });
  },

  closeReportModal: function() {
    this.setData({ showReportModal: false });
  },

  handleToggleSafetyDetails: function() {
    this.setData({
      showSafetyDetails: !this.data.showSafetyDetails
    });
  },

  handleContactWechat: function() {
    const wechat = this.data.wish.contact?.wechat;
    if (!wechat) return;
    
    wx.setClipboardData({
      data: wechat,
      success: function() {
        wx.showToast({
          title: '微信已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  handleContactPhone: function() {
    const phone = this.data.wish.contact?.phone;
    if (!phone) return;
    
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function() {
        console.log('拨打成功');
      },
      fail: function() {
        console.log('拨打失败');
      }
    });
  },

  navigateToLogin: function() {
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    });
  },

  handleNavigate: function() {
    const location = this.data.wish.location;
    if (!location || !location.latitude || !location.longitude) return;
    
    wx.openLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.address || '位置',
      address: location.address || '',
      scale: 18
    });
  },

  handleLike: function() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    const wishId = this.data.wish.id;
    const currentLiked = this.data.liked;
    const api = currentLiked ? wishWallAPI.unlikeWish(wishId) : wishWallAPI.likeWish(wishId);
    
    api.then(() => {
        const newLiked = !currentLiked;
        this.setData({ liked: newLiked });
        
        if (this.data.wish.stats) {
          this.setData({
            'wish.stats.likes': newLiked 
              ? (this.data.wish.stats.likes || 0) + 1 
              : Math.max(0, (this.data.wish.stats.likes || 0) - 1)
          });
        }
        
        wx.showToast({
          title: newLiked ? '已标记感兴趣' : '已取消感兴趣',
          icon: 'success',
          duration: 2000
        });
      }).catch(() => {
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      });
  },

  handleCollect: function() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    const wishId = this.data.wish.id;
    const currentCollected = this.data.collected;
    const api = currentCollected ? wishWallAPI.uncollectWish(wishId) : wishWallAPI.collectWish(wishId);
    
    api.then(() => {
        const newCollected = !currentCollected;
        this.setData({ collected: newCollected });
        
        if (this.data.wish.stats) {
          this.setData({
            'wish.stats.favorites': newCollected 
              ? (this.data.wish.stats.favorites || 0) + 1 
              : Math.max(0, (this.data.wish.stats.favorites || 0) - 1)
          });
        }
        
        wx.showToast({
          title: newCollected ? '收藏成功' : '取消收藏',
          icon: 'success',
          duration: 2000
        });
      }).catch(() => {
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      });
  },

  onShareAppMessage: function() {
    const wish = this.data.wish || {};
    return {
      title: wish.title ? `${wish.title} - 心愿详情` : '心愿详情',
      path: `/pages/wish-detail/wish-detail?id=${wish.id || ''}`
    };
  }
});