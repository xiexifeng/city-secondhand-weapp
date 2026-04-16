Page({
  data: {
    detail: {
      id: 1,
      type: 'item',
      title: 'iPhone 14 Pro Max',
      description: '全新未开封，原厂包装，支持分期付款，可刀价。联系方式：13800138000',
      images: [
        'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop&q=80'
      ],
      category: '数码3C',
      tags: ['新品', '原装', '可议价'],
      price: '¥5800',
      exchangeMethod: '人民币',
      publisher: {
        name: '张三',
        avatar: 'Z',
        level: '活跃用户',
        credit: 95
      },
      submittedAt: '2小时前',
      reason: '包含联系方式',
      machineScore: 65,
      issues: ['包含电话号码', '描述过于简洁'],
      status: 'pending'
    },
    rejectReason: '',
    isProcessing: false
  },

  onLoad: function(options) {
    const itemId = options.id;
    if (itemId) {
      this.loadDetail(itemId);
    }
  },

  /**
   * Load detail data
   */
  loadDetail: function(itemId) {
    // In real app, fetch from API
    // For now, use mock data
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * On reject reason change
   */
  onRejectReasonChange: function(e) {
    this.setData({
      rejectReason: e.detail.value
    });
  },

  /**
   * Handle approve
   */
  handleApprove: function() {
    this.setData({ isProcessing: true });
    
    setTimeout(() => {
      this.setData({
        'detail.status': 'approved',
        isProcessing: false
      });
      
      wx.showToast({
        title: '审核通过',
        icon: 'success',
        duration: 2000
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  /**
   * Handle reject
   */
  handleReject: function() {
    if (!this.data.rejectReason.trim()) {
      wx.showToast({
        title: '请填写拒绝原因',
        icon: 'none'
      });
      return;
    }

    this.setData({ isProcessing: true });
    
    setTimeout(() => {
      this.setData({
        'detail.status': 'rejected',
        isProcessing: false
      });
      
      wx.showToast({
        title: '已拒绝',
        icon: 'success',
        duration: 2000
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  }
});
