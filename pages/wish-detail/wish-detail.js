// pages/wish-detail/wish-detail.js

const mockWishes = [
  {
    id: 1,
    title: '求购 iPhone 15 Pro',
    description: '预算2000元以内，或用我的旧Switch换',
    category: '数码3C',
    budget: '2000元以内',
    distance: 1.2,
    time: '2小时前',
    userName: '小明',
    verified: true,
    active: true,
    contact: {
      wechat: 'xiaoming123',
      phone: '13812345678'
    },
    location: {
      address: '北京市朝阳区建国路88号',
      latitude: 39.908722,
      longitude: 116.466362
    },
    stats: {
      views: 156,
      likes: 23,
      favorites: 15
    }
  },
  {
    id: 2,
    title: '求换 MacBook Pro',
    description: '用我的iPad Air + 差价换，或者积分',
    category: '数码3C',
    budget: '差价1000-2000',
    distance: 0.8,
    time: '30分钟前',
    userName: '李女士',
    verified: true,
    active: true,
    contact: {
      wechat: 'lily456',
      phone: '13987654321'
    },
    location: {
      address: '北京市海淀区中关村大街1号',
      latitude: 39.984702,
      longitude: 116.305526
    },
    stats: {
      views: 89,
      likes: 15,
      favorites: 10
    }
  },
  {
    id: 3,
    title: '求购 Sony A7IV 相机',
    description: '新手摄影爱好者，预算5000-6000',
    category: '摄影器材',
    budget: '5000-6000元',
    distance: 2.5,
    time: '1小时前',
    userName: '摄影师王',
    verified: false,
    active: true,
    contact: {
      wechat: 'wangphoto',
      phone: '13712345678'
    },
    location: {
      address: '北京市东城区王府井大街99号',
      latitude: 39.914344,
      longitude: 116.415697
    },
    stats: {
      views: 234,
      likes: 42,
      favorites: 28
    }
  },
  {
    id: 4,
    title: '求换 PS5 游戏机',
    description: '用我的Nintendo Switch + 现金换',
    category: '游戏',
    budget: '差价500-800',
    distance: 3.1,
    time: '3小时前',
    userName: '游戏玩家',
    verified: true,
    active: true,
    contact: {
      wechat: 'gamer123',
      phone: '13687654321'
    },
    location: {
      address: '北京市西城区西单北大街120号',
      latitude: 39.913993,
      longitude: 116.366808
    },
    stats: {
      views: 178,
      likes: 31,
      favorites: 22
    }
  },
  {
    id: 5,
    title: '求购 自行车',
    description: '山地车或公路车，要求成色好',
    category: '运动户外',
    budget: '1000-2000元',
    distance: 0.5,
    time: '5分钟前',
    userName: '骑行爱好者',
    verified: true,
    active: true,
    contact: {
      wechat: 'cyclist567',
      phone: '13512345678'
    },
    location: {
      address: '北京市丰台区丰台体育中心',
      latitude: 39.848676,
      longitude: 116.286797
    },
    stats: {
      views: 92,
      likes: 18,
      favorites: 12
    }
  },
  {
    id: 6,
    title: '求换 iPad Pro',
    description: '用我的MacBook Air + 现金差价换',
    category: '数码3C',
    budget: '差价2000-3000',
    distance: 1.8,
    time: '45分钟前',
    userName: '科技爱好者',
    verified: true,
    active: true,
    contact: {
      wechat: 'techlover',
      phone: '13487654321'
    },
    location: {
      address: '北京市昌平区回龙观东大街',
      latitude: 40.078778,
      longitude: 116.359094
    },
    stats: {
      views: 145,
      likes: 27,
      favorites: 18
    }
  },
  {
    id: 7,
    title: '求购 Canon 单反相机',
    description: '全画幅相机，预算8000-10000',
    category: '摄影器材',
    budget: '8000-10000元',
    distance: 2.2,
    time: '1.5小时前',
    userName: '摄影初学者',
    verified: false,
    active: false,
    contact: {
      wechat: 'beginnerphoto',
      phone: '13312345678'
    },
    location: {
      address: '北京市石景山区鲁谷路35号',
      latitude: 39.903298,
      longitude: 116.223611
    },
    stats: {
      views: 189,
      likes: 35,
      favorites: 25
    }
  },
  {
    id: 8,
    title: '求换 Nintendo Switch',
    description: '用我的PS4 + 差价换',
    category: '游戏',
    budget: '差价800-1200',
    distance: 0.3,
    time: '20分钟前',
    userName: '游戏迷',
    verified: true,
    active: true,
    contact: {
      wechat: 'switchfan',
      phone: '13287654321'
    },
    location: {
      address: '北京市通州区运河东路',
      latitude: 39.909746,
      longitude: 116.656738
    },
    stats: {
      views: 123,
      likes: 21,
      favorites: 15
    }
  },
  {
    id: 9,
    title: '求购 Airpods Pro',
    description: '最新款，预算1500元以内',
    category: '数码3C',
    budget: '1500元以内',
    distance: 1.5,
    time: '1小时前',
    userName: '上班族',
    verified: true,
    active: true,
    contact: {
      wechat: 'officeworker',
      phone: '13112345678'
    },
    location: {
      address: '北京市大兴区亦庄经济技术开发区',
      latitude: 39.806073,
      longitude: 116.636293
    },
    stats: {
      views: 201,
      likes: 38,
      favorites: 26
    }
  },
  {
    id: 10,
    title: '求换 Rolex 手表',
    description: '用我的Omega + 差价换',
    category: '奢侈品',
    budget: '差价5000-8000',
    distance: 4.2,
    time: '2小时前',
    userName: '表迷',
    verified: true,
    active: false,
    contact: {
      wechat: 'watchlover',
      phone: '13087654321'
    },
    location: {
      address: '北京市顺义区空港街道',
      latitude: 40.130175,
      longitude: 116.669885
    },
    stats: {
      views: 256,
      likes: 47,
      favorites: 32
    }
  }
];

Page({
  data: {
    wish: null,
    showReportModal: false,
    showSafetyDetails: false,
    isLoggedIn: true, // 模拟登录状态
    markers: [],
    liked: false,
    collected: false
  },

  onLoad: function(options) {
    const wishId = parseInt(options.id);
    const wish = mockWishes.find(w => w.id === wishId);
    
    if (wish) {
      // 初始化地图标记
      const markers = [{
        id: 0,
        latitude: wish.location.latitude,
        longitude: wish.location.longitude,
        title: wish.title,
        width: 30,
        height: 30
      }];
      
      this.setData({ 
        wish: wish,
        markers: markers
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
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * Handle share
   */
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

  /**
   * Handle report
   */
  handleReport: function() {
    this.setData({ showReportModal: true });
  },

  /**
   * Close report modal
   */
  closeReportModal: function() {
    this.setData({ showReportModal: false });
  },

  /**
   * Toggle safety details
   */
  handleToggleSafetyDetails: function() {
    this.setData({
      showSafetyDetails: !this.data.showSafetyDetails
    });
  },

  /**
   * Handle contact wechat
   */
  handleContactWechat: function() {
    const wechat = this.data.wish.contact.wechat;
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

  /**
   * Handle contact phone
   */
  handleContactPhone: function() {
    const phone = this.data.wish.contact.phone;
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

  /**
   * Navigate to login
   */
  navigateToLogin: function() {
    wx.showToast({
      title: '跳转到登录页面',
      icon: 'none',
      duration: 2000
    });
    // In a real app, this would navigate to login page
    // wx.navigateTo({
    //   url: '/pages/login/login'
    // });
  },

  /**
   * Handle navigate to location
   */
  handleNavigate: function() {
    const { latitude, longitude, address } = this.data.wish.location;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: address,
      address: address,
      scale: 18
    });
  },

  /**
   * Handle like (interested)
   */
  handleLike: function() {
    const currentLiked = this.data.liked;
    const newLiked = !currentLiked;
    
    // 更新感兴趣状态
    this.setData({
      liked: newLiked
    });
    
    // 模拟感兴趣/取消感兴趣的反馈
    wx.showToast({
      title: newLiked ? '已标记感兴趣' : '已取消感兴趣',
      icon: 'success',
      duration: 2000
    });
  },

  /**
   * Handle collect (favorite)
   */
  handleCollect: function() {
    const currentCollected = this.data.collected;
    const newCollected = !currentCollected;
    
    // 更新收藏状态
    this.setData({
      collected: newCollected
    });
    
    // 模拟收藏/取消收藏的反馈
    wx.showToast({
      title: newCollected ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 2000
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
