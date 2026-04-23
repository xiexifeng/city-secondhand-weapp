Page({
  data: {
    activeCount: 0,
    totalInterests: 0,
    totalViews: 0,
    activeWishes: [],
    archivedWishes: [],
    activeMenu: null,
    wishes: [
      {
        id: 1,
        title: '求 iPad Pro M4 11寸',
        description: '想要一台iPad Pro用于设计工作，可用MacBook Pro 2019加差价交换',
        category: '数码3C',
        expectedMethod: '以物换物',
        priceRange: '差价 5000-8000',
        status: '活跃',
        createdAt: '2024-03-20',
        views: 45,
        interests: 3,
        reviewStatus: '已通过'
      },
      {
        id: 2,
        title: '求 Sony A6400 相机',
        description: '需要一台微单相机，预算3000-4000元',
        category: '数码3C',
        expectedMethod: '人民币',
        priceRange: '3000-4000',
        status: '活跃',
        createdAt: '2024-03-18',
        views: 28,
        interests: 2,
        reviewStatus: '待审核'
      },
      {
        id: 3,
        title: '求 Dyson 吹风机',
        description: '想要一台Dyson吹风机，可用旧吹风机加现金交换',
        category: '美妆个护',
        expectedMethod: '都可以',
        status: '已下架',
        createdAt: '2024-03-15',
        views: 12,
        interests: 0,
        reviewStatus: '审核不通过',
        rejectionReason: '描述信息不清楚'
      },
      {
        id: 4,
        title: '求 Nintendo Switch OLED',
        description: '想要一台Nintendo Switch OLED，可用PS4加差价交换',
        category: '数码3C',
        expectedMethod: '以物换物',
        priceRange: '差价 1000-1500',
        status: '活跃',
        createdAt: '2024-03-10',
        views: 35,
        interests: 1,
        reviewStatus: '审核不通过',
        rejectionReason: '缺少详细描述'
      }
    ]
  },

  onLoad: function() {
    this.computeStats();
  },

  /**
   * Compute stats and set data
   */
  computeStats: function() {
    const { wishes } = this.data;
    
    const reviewStatusClassMap = {
      '待审核': 'review-pending',
      '已通过': 'review-approved',
      '审核不通过': 'review-rejected'
    };
    
    const reviewStatusLabelMap = {
      '待审核': '待审核',
      '已通过': '已通过',
      '审核不通过': '审核不通过'
    };
    
    // 为每个心愿添加reviewStatusClass和reviewStatusLabel字段
    const processedWishes = wishes.map(wish => ({
      ...wish,
      reviewStatusClass: reviewStatusClassMap[wish.reviewStatus] || 'review-pending',
      reviewStatusLabel: reviewStatusLabelMap[wish.reviewStatus] || wish.reviewStatus
    }));
    
    const activeCount = processedWishes.filter(w => w.status === '活跃').length;
    const totalInterests = processedWishes.reduce((sum, w) => sum + w.interests, 0);
    const totalViews = processedWishes.reduce((sum, w) => sum + w.views, 0);
    const activeWishes = processedWishes.filter(w => w.status === '活跃');
    const archivedWishes = processedWishes.filter(w => w.status === '已下架');
    
    this.setData({
      wishes: processedWishes,
      activeCount,
      totalInterests,
      totalViews,
      activeWishes,
      archivedWishes
    });
  },



  /**
   * Toggle menu
   */
  toggleMenu: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const { activeMenu } = this.data;
    this.setData({
      activeMenu: activeMenu === id ? null : id
    });
  },

  /**
   * Close menu
   */
  closeMenu: function() {
    this.setData({
      activeMenu: null
    });
  },

  /**
   * Handle edit
   */
  handleEdit: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    // 关闭菜单
    this.setData({
      activeMenu: null
    });
    // 获取全局应用实例
    const app = getApp();
    // 存储编辑ID到全局数据
    app.globalData.editWishId = id;
    // 跳转到发布页面
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },



  /**
   * Handle toggle status
   */
  handleToggleStatus: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const { wishes } = this.data;
    const updatedWishes = wishes.map(w => 
      w.id === id 
        ? { ...w, status: w.status === '活跃' ? '已下架' : '活跃' }
        : w
    );
    this.setData({
      wishes: updatedWishes,
      activeMenu: null
    });
    this.computeStats();
    wx.showToast({
      title: '状态已更新',
      icon: 'success'
    });
  },

  /**
   * Handle delete
   */
  handleDelete: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    wx.showModal({
      title: '删除心愿',
      content: '确定要删除这个心愿吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedWishes = this.data.wishes.filter(w => w.id !== id);
          this.setData({
            wishes: updatedWishes,
            activeMenu: null
          });
          this.computeStats();
          wx.showToast({
            title: '心愿已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * Navigate to publish
   */
  navigateToPublish: function() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },

  /**
   * No operation
   */
  noop: function() {
    // 空操作，用于阻止事件冒泡
  }
});
