Page({
  data: {
    isLoggedIn: false,
    item: {
      id: 1,
      title: 'iPhone 14 Pro Max',
      price: 5800,
      method: 'sell',
      verified: true,
      urgent: false,
      images: [
        'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop&q=85',
        'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop&q=85',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=500&fit=crop&q=85'
      ],
      distance: '1.2',
      time: '2小时前',
      tags: ['全新未拆封', '国行版本', '原装配件'],
      description: 'iPhone 14 Pro Max，2023年3月购买，全新未拆封，国行版本。配件齐全，有原装盒子和充电器。成色完美，无磕碰。因为已经有一部手机了，所以转让。诚心出售，价格可小刀。',
      seller: {
        avatar: '王',
        name: '王先生',
        verified: true,
        items: 23,  // 发布物品数量
        sold: 18,  // 已转让数量
        transferRate: 0.5  // 已转让率
      },
      location: {
        address: '深圳市福田区上梅林地铁站A口',
        latitude: 22.5707,  // 北京坐标示例
        longitude: 114.0595
      },
      contact: {
        wechat: 'wangxiansheng123',
        phone: '13800138000'
      },
      stats: {
        views: 245,
        likes: 18,
        favorites: 12
      }
    },
    markers: [
      {
        id: 1,
        latitude: 39.9042,
        longitude: 116.4074,
        title: '交易地点',
        iconPath: '',
        width: 32,
        height: 32
      }
    ],
    currentImageIndex: 0,
    liked: false,
    collected: false,
    showSafetyDetails: true,
    copied: false,
    // 举报相关
    showReportModal: false
  },

  onLoad: function(options) {
    // Load item details based on item ID
    if (options.id) {
      console.log('Loading item:', options.id);
    }
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 计算已转让率
    const item = this.data.item;
    const transferRate = (item.seller.sold / item.seller.items * 100).toFixed(2);
    item.seller.transferRate = transferRate;
    this.setData({ item });
    
    // 获取用户位置并计算距离
    this.calculateDistance();
    
    // 更新markers坐标
    this.updateMapMarkers();
  },

  // 计算实时距离
  calculateDistance: function() {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        const userLat = res.latitude;
        const userLng = res.longitude;
        const item = that.data.item;
        const itemLat = item.location.latitude;
        const itemLng = item.location.longitude;
        
        // 使用Haversine公式计算距离
        const distance = that.getDistance(userLat, userLng, itemLat, itemLng);
        item.distance = distance.toFixed(1);
        that.setData({ item });
      },
      fail: function() {
        // 用户拒绝授权或获取位置失败，使用默认距离
        console.log('获取位置失败，使用默认距离');
      }
    });
  },

  // Haversine公式计算两点之间的距离（单位：公里）
  getDistance: function(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    return distance;
  },

  // 角度转弧度
  deg2rad: function(deg) {
    return deg * (Math.PI/180);
  },

  /**
   * Check login status
   */
  checkLoginStatus: function() {
    const token = wx.getStorageSync('authToken');
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
    const { liked } = this.data;
    this.setData({ liked: !liked });
    wx.showToast({
      title: liked ? '已取消感兴趣' : '已标记感兴趣',
      icon: 'success',
      duration: 1500
    });
  },

  // Collect (favorite)
  handleCollect: function() {
    const { collected } = this.data;
    this.setData({ collected: !collected });
    wx.showToast({
      title: collected ? '已取消收藏' : '已收藏',
      icon: 'success',
      duration: 1500
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
