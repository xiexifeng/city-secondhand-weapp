Page({
  data: {
    filterStatus: 'pending',
    items: [
      {
        id: 1,
        type: 'item',
        title: 'iPhone 14 Pro Max',
        description: '全新未开封，原厂包装，支持分期付款，可刀价',
        image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop&q=80',
        category: '数码3C',
        publisher: {
          name: '张三',
          avatar: 'Z'
        },
        submittedAt: '2小时前',
        reason: '包含联系方式',
        status: 'pending'
      },
      {
        id: 2,
        type: 'wish',
        title: '求购 MacBook Pro 2019',
        description: '寻找成色好的MacBook Pro 2019款，预算5000-6000元',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&q=80',
        category: '数码3C',
        publisher: {
          name: '李四',
          avatar: 'L'
        },
        submittedAt: '1小时前',
        reason: '描述不清晰',
        status: 'pending'
      },
      {
        id: 3,
        type: 'item',
        title: 'Sony A6400 相机',
        description: '95新，带原厂镜头和配件，可议价',
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop&q=80',
        category: '数码3C',
        publisher: {
          name: '王五',
          avatar: 'W'
        },
        submittedAt: '30分钟前',
        reason: '图片质量低',
        status: 'pending'
      },
      {
        id: 4,
        type: 'wish',
        title: '求换 iPad Air',
        description: '有iPad Air吗？我可以用iPhone 12换',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop&q=80',
        category: '数码3C',
        publisher: {
          name: '赵六',
          avatar: 'Z'
        },
        submittedAt: '15分钟前',
        reason: null,
        status: 'pending'
      },
      {
        id: 5,
        type: 'item',
        title: 'Nike 跑鞋',
        description: '全新未穿，官方正品，尺码42，可快递',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&q=80',
        category: '服饰鞋包',
        publisher: {
          name: '孙七',
          avatar: 'S'
        },
        submittedAt: '10分钟前',
        reason: null,
        status: 'pending'
      }
    ],
    filteredItems: []
  },

  onLoad: function() {
    this.computeStats();
  },

  /**
   * Set filter status
   */
  setFilterStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ filterStatus: status });
    this.computeStats();
  },

  /**
   * Compute stats and filter items
   */
  computeStats: function() {
    const items = this.data.items;
    const filterStatus = this.data.filterStatus;

    const stats = {
      pending: items.filter(i => i.status === 'pending').length,
      approved: items.filter(i => i.status === 'approved').length,
      rejected: items.filter(i => i.status === 'rejected').length,
      totalReviewed: items.filter(i => i.status !== 'pending').length
    };

    const filteredItems = filterStatus === 'all' 
      ? items 
      : items.filter(i => i.status === 'pending');

    this.setData({
      stats: stats,
      filteredItems: filteredItems
    });
  },

  /**
   * Navigate to detail
   */
  navigateToDetail: function(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/moderation-detail/moderation-detail?id=${itemId}`
    });
  }
});
