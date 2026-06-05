// pages/wish-detail/wish-detail.js
const { wishWallAPI } = require('../../utils/api.js')
const { itemAPI } = require('../../utils/api.js')
const { formatRelativeTime, formatDistance } = require('../../utils/format.js')
const app = getApp()

Page({
  data: {
    wish: null,
    wishId: null,
    showReportModal: false,
    showSafetyDetails: true,
    isLoggedIn: false,
    markers: [],
    liked: false,
    collected: false,
    latitude: null,
    longitude: null,
    contactRevealed: false
  },

  onLoad: function(options) {
    const wishId = options.id;
    this.setData({ wishId: wishId });
    this.checkLoginStatus();
    this.getLocationAndLoadWishDetail(wishId);
  },

  /**
   * Check login status
   */
  checkLoginStatus: function() {
    this.setData({ isLoggedIn: app.isLoggedIn() });
  },

  async getLocationAndLoadWishDetail(wishId) {
    try {
      const cachedLocation = app.getCachedLocation();
      if (cachedLocation.latitude !== null) {
        this.setData({ latitude: cachedLocation.latitude, longitude: cachedLocation.longitude });
      }
    } catch (e) {
      console.log('无缓存位置');
    }
    this.loadWishDetail(wishId);
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
          this.recordView(wishId);
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
      location: {address: locationInfo.address, name: locationInfo.name, latitude: data.latitude, longitude: data.longitude},
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
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
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

  handleRevealContact: function() {
    if (this.data.contactRevealed) return;
    if (!this.data.isLoggedIn) {
      app.goToLogin();
      return;
    }
    wx.showLoading({ title: '加载中...' });
    itemAPI.viewContact(this.data.wishId, 'WISH')
      .then(res => {
        wx.hideLoading();
        this.setData({
          'wish.contact.wechat': res.wechat || '',
          'wish.contact.phone': res.phone || '',
          contactRevealed: true
        });
        if(res.code){
          if (res.code === '000101') {
            wx.showToast({ title: '今日查看次数已达上限', icon: 'none' });
          } else {
            wx.showToast({ title: '获取联系方式失败', icon: 'none' });
          }
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '获取联系方式失败', icon: 'none' });
      });
  },

  handleContactWechat: function() {
    const wechat = this.data.wish.contact?.wechat;
    if (!wechat) return;
    
    wx.setClipboardData({
      data: wechat,
      success: function() {
        wx.showToast({
          title: '微信号已复制',
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
      duration: 1500
    });
    setTimeout(() => {
      app.goToLogin();
    }, 1500);
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

  recordView: function(wishId) {
    if (!this.data.isLoggedIn) return;
    wishWallAPI.socialWish(wishId, 'VIEW', 'ADD').catch(err => {
      console.error('记录浏览失败:', err);
    });
  },

  handleLike: function() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    const { liked, wishId } = this.data;
    const newLiked = !liked;
    const operate = newLiked ? 'ADD' : 'CANCEL';
    
    wishWallAPI.socialWish(wishId, 'LOVE', operate)
      .then(() => {
        this.setData({ liked: newLiked });
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
    
    const { collected, wishId } = this.data;
    const newCollected = !collected;
    const operate = newCollected ? 'ADD' : 'CANCEL';
    
    wishWallAPI.socialWish(wishId, 'COLLECTION', operate)
      .then(() => {
        this.setData({ collected: newCollected });
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
    const title = wish.title || '心愿推荐';
    const budgetInfo = wish.budget ? `，预算${wish.budget}` : '';
    return {
      title: `✨ ${title}${budgetInfo}！来换换么帮TA实现心愿吧`,
      path: `/pages/wish-detail/wish-detail?id=${wish.id || ''}`
    };
  },

  onShareTimeline: function() {
    const wish = this.data.wish || {};
    const title = wish.title || '心愿推荐';
    const budgetInfo = wish.budget ? `，预算${wish.budget}` : '';
    return {
      title: `✨ ${title}${budgetInfo}！换换么心愿墙，闲置交换环保又省钱`,
      query: `id=${wish.id || ''}`
    };
  }
});