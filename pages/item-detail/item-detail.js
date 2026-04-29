const { formatRelativeTime, formatDistance } = require('../../utils/format.js');
const { itemAPI, request, socialAPI } = require('../../utils/api.js');

Page({
  data: {
    isLoggedIn: false,
    item: {},
    markers: [],
    currentImageIndex: 0,
    liked: false,
    collected: false,
    showSafetyDetails: true,
    copied: false,
    showReportModal: false,
    loading: true
  },

  onLoad: function(options) {
    this.checkLoginStatus();
    
    if (options.id) {
      this.setData({ itemId: options.id });
      this.loadItemDetail(options.id);
      this.recordView(options.id);
    }
  },

  loadItemDetail: function(itemId) {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.fetchItemDetail(itemId, res.latitude, res.longitude);
      },
      fail: function() {
        that.fetchItemDetail(itemId, null, null);
      }
    });
  },

  fetchItemDetail: function(itemId, latitude, longitude) {
    const that = this;
    
    itemAPI.getItemDetail(itemId, latitude, longitude)
      .then(res => {
        const data = res.data;
        const item = that.transformItemData(data);
        that.setData({ 
          item, 
          loading: false,
          liked: data.isLiked || false,
          collected: data.isCollected || false
        });
        console.log(item)
        that.updateMapMarkers();
      })
      .catch(err => {
        console.error('获取物品详情失败:', err);
        that.setData({ loading: false });
        wx.showToast({
          title: '获取详情失败',
          icon: 'error'
        });
      });
  },

  transformItemData: function(data) {
    let locationInfo = {};
    try {
      locationInfo = JSON.parse(data.location || '{}');
    } catch (e) {
      locationInfo = { location: data.location };
    }
    
    const distanceResult = formatDistance(data.distance);
    
    return {
      id: data.id,
      title: data.title,
      price: data.price,
      method: data.method || 'sell',
      urgent: data.urgent || false,
      images: data.itemImageList || [],
      distance: data.distance,
      formattedDistance: distanceResult.text,
      distanceType: distanceResult.type,
      time: data.time,
      formattedTime: formatRelativeTime(data.time),
      tags: data.tags || [],
      description: data.description || '',
      wantItem: data.wantItem || '',
      seller: {
        avatar: data.userExt ? data.userExt.avatarUrl || '' : '',
        name: data.userExt ? data.userExt.nickname || '' : '',
        verified: data.userExt ? data.userExt.verified || false : false,
        items: data.userExt ? data.userExt.itemCount || 0 : 0,
        transferRate: data.userExt ? Math.round((data.userExt.transferRate || 0) * 100) : 0
      },
      location: {
        address: locationInfo.location || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0
      },
      contact: {
        wechat: data.wechat || '',
        phone: data.phone || ''
      },
      stats: {
        views: data.views || 0,
        likes: data.likes || 0,
        favorites: data.favorites || 0
      }
    };
  },

  /**
   * Check login status
   */
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    this.setData({ isLoggedIn: !!token });
  },

  /**
   * Navigate to login
   */
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 更新地图标记点
   */
  updateMapMarkers: function() {
    const { item } = this.data;
    const markers = [{
      id: 1,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      title: '交易地点',
      width: 32,
      height: 32
    }];
    this.setData({ markers });
  },

  // 记录浏览
  recordView: function(itemId) {
    if (!this.data.isLoggedIn) return;
    socialAPI.socialItem(itemId, 'VIEW', 'ADD').catch(err => {
      console.error('记录浏览失败:', err);
    });
  },

  // Image navigation
  handlePrevImage: function() {
    const { currentImageIndex, item } = this.data;
    if (currentImageIndex > 0) {
      this.setData({ currentImageIndex: currentImageIndex - 1 });
    }
  },

  handleNextImage: function() {
    const { currentImageIndex, item } = this.data;
    if (currentImageIndex < item.images.length - 1) {
      this.setData({ currentImageIndex: currentImageIndex + 1 });
    }
  },

  handleSelectImage: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentImageIndex: index });
  },

  // Like (interested)
  handleLike: function() {
    const { liked, itemId, isLoggedIn } = this.data;
    
    if (!isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    const newLiked = !liked;
    const operate = newLiked ? 'ADD' : 'CANCEL';
    
    socialAPI.socialItem(itemId, 'LOVE', operate)
      .then(() => {
        this.setData({ liked: newLiked });
        wx.showToast({
          title: newLiked ? '已标记感兴趣' : '已取消感兴趣',
          icon: 'success',
          duration: 1500
        });
      })
      .catch(err => {
        console.error('点赞失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'error',
          duration: 1500
        });
      });
  },

  // Collect (favorite)
  handleCollect: function() {
    const { collected, itemId, isLoggedIn } = this.data;
    
    if (!isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    const newCollected = !collected;
    const operate = newCollected ? 'ADD' : 'CANCEL';
    
    socialAPI.socialItem(itemId, 'COLLECTION', operate)
      .then(() => {
        this.setData({ collected: newCollected });
        wx.showToast({
          title: newCollected ? '已收藏' : '已取消收藏',
          icon: 'success',
          duration: 1500
        });
      })
      .catch(err => {
        console.error('收藏失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'error',
          duration: 1500
        });
      });
  },

  // Seller
  handleViewSeller: function() {
    wx.showToast({
      title: '查看卖家详情',
      icon: 'none'
    });
  },

  // Safety details toggle
  handleToggleSafetyDetails: function() {
    this.setData({ showSafetyDetails: !this.data.showSafetyDetails });
  },

  // Contact methods
  handleContactWechat: function() {
    const { item } = this.data;
    wx.setClipboardData({
      data: item.contact.wechat,
      success: () => {
        wx.showToast({
          title: '已复制微信号',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  handleContactPhone: function() {
    const { item } = this.data;
    wx.makePhoneCall({
      phoneNumber: item.contact.phone
    });
  },

  // 举报相关函数
  handleReport: function() {
    this.setData({ showReportModal: true });
  },

  // 关闭举报模态框
  closeReportModal: function() {
    this.setData({ showReportModal: false });
  },

  // Share
  handleShare: function() {
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  // Back
  handleBack: function() {
    wx.navigateBack();
  },

  // Map actions


  handleNavigate: function() {
    const { item } = this.data;
    wx.openLocation({
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      name: '交易地点',
      address: item.location.address,
      scale: 15
    });
  }
});
