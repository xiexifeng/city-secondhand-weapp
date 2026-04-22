Page({
  data: {
    detail: {
      id: 1,
      type: 'item',
      title: 'iPhone 14 Pro Max',
      description: '全新未开封，原厂包装，支持分期付款，可刀价',
      images: [
        'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&q=80'
      ],
      category: '数码3C',
      tags: ['全新', '包邮', '可分期'],
      price: '8999',
      exchangeMethod: null,
      publisher: {
        name: '张三',
        avatar: 'Z',
        level: '活跃用户',
        credit: 95,
        verified: true,
        items: 12,
        transferRate: 95
      },
      submittedAt: '2小时前',
      reason: '包含联系方式',
      machineScore: 75,
      issues: ['检测到电话号码', '包含微信号'],
      status: 'pending',
      location: '北京市朝阳区望京SOHO',
      distance: 2.5
    },
    currentImageIndex: 0,
    reviewStatus: null,
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
    // In real app, fetch from API using itemId
    // For now, use mock data
  },

  /**
   * Handle previous image
   */
  handlePrevImage: function() {
    const currentIndex = this.data.currentImageIndex;
    const imagesLength = this.data.detail.images.length;
    const newIndex = currentIndex === 0 ? imagesLength - 1 : currentIndex - 1;
    this.setData({ currentImageIndex: newIndex });
  },

  /**
   * Handle next image
   */
  handleNextImage: function() {
    const currentIndex = this.data.currentImageIndex;
    const imagesLength = this.data.detail.images.length;
    const newIndex = (currentIndex + 1) % imagesLength;
    this.setData({ currentImageIndex: newIndex });
  },

  /**
   * Handle select image from thumbnail
   */
  handleSelectImage: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentImageIndex: index });
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * Set review status
   */
  setReviewStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 
      reviewStatus: status,
      rejectReason: ''
    });
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
   * Handle submit review
   */
  handleSubmitReview: function() {
    const { reviewStatus, rejectReason } = this.data;

    if (!reviewStatus) {
      wx.showToast({
        title: '请选择审核结论',
        icon: 'none'
      });
      return;
    }

    if (reviewStatus === 'reject' && !rejectReason.trim()) {
      wx.showToast({
        title: '请输入拒绝原因',
        icon: 'none'
      });
      return;
    }

    this.setData({ isProcessing: true });

    // Simulate API call
    setTimeout(() => {
      this.setData({
        isProcessing: false,
        'detail.status': reviewStatus === 'approve' ? 'approved' : 'rejected',
        'detail.reviewedAt': new Date().toLocaleString()
      });

      wx.showToast({
        title: reviewStatus === 'approve' ? '已通过' : '已拒绝',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  /**
   * Navigate to map page
   */
  navigateToMap: function() {
    const { location } = this.data.detail;
    // 模拟经纬度数据，实际应用中应该从接口获取
    const latitude = 39.9042;
    const longitude = 116.4074;
    
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: '交易地点',
      address: location,
      scale: 15
    });
  }
});
