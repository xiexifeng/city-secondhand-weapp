Page({
  data: {
    activeTab: 'items',
    itemsList: [
      {
        id: 1,
        title: 'iPhone 13 Pro 128GB 远峰蓝',
        price: 4999,
        time: '2026-04-23 15:20',
        image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
        views: 128,
        interested: 15,
        collected: 8,
        transactionType: '人民币'
      },
      {
        id: 2,
        title: 'AirPods Pro 2 全新未拆封',
        price: 1299,
        time: '2026-04-22 10:15',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        views: 86,
        interested: 12,
        collected: 5,
        transactionType: '人民币'
      },
      {
        id: 3,
        title: 'MacBook Air M2 13英寸',
        price: 8999,
        time: '2026-04-21 18:45',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        views: 215,
        interested: 23,
        collected: 12,
        transactionType: '人民币'
      },
      {
        id: 4,
        title: 'Nike 跑鞋 42码',
        price: 0,
        time: '2026-04-20 14:30',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        views: 78,
        interested: 9,
        collected: 4,
        transactionType: '以物换物',
        exchangeItem: 'Adidas 运动外套'
      },
      {
        id: 5,
        title: 'Sony A6400 相机',
        price: 0,
        time: '2026-04-19 10:15',
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
        views: 145,
        interested: 18,
        collected: 7,
        transactionType: '以物换物',
        exchangeItem: 'iPad Pro 11英寸'
      }
    ],
    wishesList: [
      {
        id: 1,
        title: '求换 iPhone 15 Pro',
        description: '用我的iPhone 13 Pro 128GB换iPhone 15 Pro，补差价',
        time: '2026-04-20 09:30',
        views: 98,
        interested: 12,
        collected: 5,
        matches: 5,
        followers: 3,
        newRecommendations: 2
      },
      {
        id: 2,
        title: '求换 AirPods Pro',
        description: '用我的Beats耳机换AirPods Pro',
        time: '2026-04-19 14:00',
        views: 65,
        interested: 8,
        collected: 3,
        matches: 3,
        followers: 2,
        newRecommendations: 1
      }
    ]
  },

  onLoad: function() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    // 页面加载时的初始化
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * 切换tab
   */
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  /**
   * 移除收藏
   */
  removeFavorite: function(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    
    if (type === 'items') {
      const updatedList = this.data.itemsList.filter(item => item.id !== id);
      this.setData({
        itemsList: updatedList
      });
    } else if (type === 'wishes') {
      const updatedList = this.data.wishesList.filter(item => item.id !== id);
      this.setData({
        wishesList: updatedList
      });
    }
  },

  /**
   * 跳转到物品详情页面
   */
  navigateToItemDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${id}`
    });
  },

  /**
   * 跳转到心愿详情页面
   */
  navigateToWishDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/wish-detail/wish-detail?id=${id}`
    });
  }
});