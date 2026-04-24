Page({
  data: {
    items: [
      {
        id: 1,
        title: 'iPhone 14 Pro Max',
        price: 5800,
        image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '9成新，无划痕，原装配件齐全',
        status: '在售',
        views: 245,
        likes: 18,
        favorites: 12,
        publishDate: '2024-03-20',
        transactionType: '人民币',
        reviewStatus: '已通过',
        location: '北京市朝阳区',
        statusClass: 'status-on-sale',
        reviewStatusClass: 'review-approved',
        reviewStatusLabel: '✓ 已通过'
      },
      {
        id: 2,
        title: 'MacBook Pro 2019',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '13寸，i5处理器，8GB内存，256GB SSD',
        status: '已成交',
        views: 312,
        likes: 42,
        favorites: 28,
        publishDate: '2024-03-15',
        transactionType: '人民币',
        reviewStatus: '已通过',
        location: '北京市朝阳区',
        statusClass: 'status-completed',
        reviewStatusClass: 'review-approved',
        reviewStatusLabel: '✓ 已通过'
      },
      {
        id: 3,
        title: 'Sony A6400 相机',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '微单相机，配16-50mm镜头，完美状态',
        status: '成交中',
        views: 156,
        likes: 12,
        favorites: 8,
        publishDate: '2024-03-18',
        transactionType: '都可以',
        reviewStatus: '待审核',
        location: '北京市朝阳区',
        statusClass: 'status-trading',
        reviewStatusClass: 'review-pending',
        reviewStatusLabel: '⏳ 待审核'
      },
      {
        id: 4,
        title: 'Nike 跑鞋',
        price: 599,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        category: '服装鞋帽',
        description: '全新未穿，官方正品，尺码42',
        status: '已下架',
        views: 89,
        likes: 5,
        favorites: 3,
        publishDate: '2024-03-19',
        transactionType: '人民币',
        reviewStatus: '审核不通过',
        rejectionReason: '图片质量低',
        location: '北京市朝阳区',
        statusClass: 'status-offline',
        reviewStatusClass: 'review-rejected',
        reviewStatusLabel: '✕ 审核不通过'
      }
    ],
    statusCounts: {
      onSale: 0,
      trading: 0,
      completed: 0
    }
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
    this.calculateStatusCounts();
  },

  /**
   * Calculate status counts
   */
  calculateStatusCounts: function() {
    const items = this.data.items;
    const statusCounts = {
      onSale: items.filter(item => item.status === '在售').length,
      trading: items.filter(item => item.status === '成交中').length,
      completed: items.filter(item => item.status === '已成交').length
    };
    this.setData({ statusCounts });
  },

  /**
   * Get status count
   */
  getStatusCount: function(status) {
    return this.data.items.filter(item => item.status === status).length;
  },

  /**
   * Get status class
   */
  getStatusClass: function(status) {
    const classes = {
      '在售': 'status-on-sale',
      '已下架': 'status-offline',
      '成交中': 'status-trading',
      '已成交': 'status-completed'
    };
    return classes[status] || 'status-on-sale';
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
      '待审核': '⏳ 待审核',
      '已通过': '✓ 已通过',
      '审核不通过': '✕ 审核不通过'
    };
    return labels[status] || '待审核';
  },

  /**
   * Get status action text
   */
  getStatusActionText: function(status) {
    if (status === '在售') {
      return '下架';
    } else if (status === '已下架') {
      return '上架';
    } else if (status === '成交中') {
      return '标记已成交';
    } else if (status === '已成交') {
      return '重新上架';
    }
    return '改变状态';
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
   * Handle edit
   */
  handleEdit: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Edit button clicked, item id:', id);
    this.setData({ activeMenu: null });
    // 存储编辑ID到全局数据
    getApp().globalData.editItemId = id;
    wx.switchTab({
      url: '/pages/publish/publish',
      success: function(res) {
        console.log('Switch tab success:', res);
      },
      fail: function(res) {
        console.log('Switch tab fail:', res);
      }
    });
  },



  /**
   * Handle status change
   */
  handleStatusChange: function(e) {
    const id = e.currentTarget.dataset.id;
    const newStatus = e.currentTarget.dataset.status;
    const { items } = this.data;
    
    const statusMap = {
      'onSale': '在售',
      'offline': '已下架',
      'completed': '已成交'
    };
    
    const statusClassMap = {
      '在售': 'status-on-sale',
      '已下架': 'status-offline',
      '成交中': 'status-trading',
      '已成交': 'status-completed'
    };
    
    const actualStatus = statusMap[newStatus] || newStatus;
    
    // 二次确认弹窗
    wx.showModal({
      title: '确认操作',
      content: '确定要将物品状态更新为: ' + actualStatus + ' 吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const updatedItems = items.map(i => {
            if (i.id === id) {
              return {
                ...i, 
                status: actualStatus,
                statusClass: statusClassMap[actualStatus] || 'status-on-sale'
              };
            }
            return i;
          });
          
          this.setData({
            items: updatedItems
          });
          
          this.calculateStatusCounts();
          
          wx.showToast({
            title: '状态已更新为: ' + actualStatus,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * Handle delete
   */
  handleDelete: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除物品',
      content: '确定要删除这个物品吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const items = this.data.items.filter(item => item.id !== id);
          this.setData({ items });
          this.calculateStatusCounts();
          wx.showToast({
            title: '物品已删除',
            icon: 'success'
          });
        }
      }
    });
  },


});
