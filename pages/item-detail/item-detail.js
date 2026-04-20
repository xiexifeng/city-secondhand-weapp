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
        favorites: 18,
        likes: 12
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
    showSafetyDetails: true,
    copied: false
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
    
    // 更新markers坐标
    this.updateMapMarkers();
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

  // Like/favorite
  handleLike: function() {
    const { liked } = this.data;
    this.setData({ liked: !liked });
    wx.showToast({
      title: liked ? '已取消收藏' : '已收藏',
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

  // Report
  handleReport: function() {
    wx.showActionSheet({
      itemList: ['虚假信息', '诈骗', '违规内容', '其他'],
      success: (res) => {
        wx.showToast({
          title: '已举报',
          icon: 'success',
          duration: 1500
        });
      }
    });
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
  }
});
