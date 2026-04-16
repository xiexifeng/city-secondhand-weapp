Page({
  data: {
    activeCount: 0,
    totalInterests: 0,
    totalViews: 0,
    activeWishes: [],
    archivedWishes: [],
    editingId: null,
    activeMenu: null,
    editForm: null,
    expectedMethodIndex: 0,
    expectedMethods: ['以物换物', '人民币', '都可以'],
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
    const activeCount = wishes.filter(w => w.status === '活跃').length;
    const totalInterests = wishes.reduce((sum, w) => sum + w.interests, 0);
    const totalViews = wishes.reduce((sum, w) => sum + w.views, 0);
    const activeWishes = wishes.filter(w => w.status === '活跃');
    const archivedWishes = wishes.filter(w => w.status === '已下架');
    
    this.setData({
      activeCount,
      totalInterests,
      totalViews,
      activeWishes,
      archivedWishes
    });
  },

  /**
   * Get review status class
   */
  getReviewStatusClass: function(status) {
    const classes = {
      '待审核': 'review-pending',
      '已通过': 'review-approved',
      '审核不通过': 'review-rejected'
    };
    return classes[status] || 'review-pending';
  },

  /**
   * Get review status label
   */
  getReviewStatusLabel: function(status) {
    const labels = {
      '待审核': '待审核',
      '已通过': '已通过',
      '审核不通过': '审核不通过'
    };
    return labels[status] || status;
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
    const wish = this.data.wishes.find(w => w.id === id);
    if (wish) {
      this.setData({
        editingId: id,
        editForm: { ...wish },
        activeMenu: null
      });
    }
  },

  /**
   * Handle save edit
   */
  handleSaveEdit: function() {
    const { editForm, wishes } = this.data;
    if (editForm) {
      const updatedWishes = wishes.map(w => w.id === editForm.id ? editForm : w);
      this.setData({
        wishes: updatedWishes,
        editingId: null,
        editForm: null
      });
      this.computeStats();
      wx.showToast({
        title: '心愿已更新',
        icon: 'success'
      });
    }
  },

  /**
   * Cancel edit
   */
  cancelEdit: function() {
    this.setData({
      editingId: null,
      editForm: null
    });
  },

  /**
   * Handle edit change
   */
  handleEditChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`editForm.${field}`]: value
    });
  },

  /**
   * Handle expected method change
   */
  handleExpectedMethodChange: function(e) {
    const index = parseInt(e.detail.value);
    const method = this.data.expectedMethods[index];
    this.setData({
      expectedMethodIndex: index,
      [`editForm.expectedMethod`]: method
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
  }
});
