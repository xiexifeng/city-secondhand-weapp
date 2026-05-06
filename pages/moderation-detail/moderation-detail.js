const { auditAPI } = require('../../utils/api');
const format = require('../../utils/format.js');
const { parseLocation } = require('../../utils/helpers.js');

Page({
  data: {
    detail: {},
    currentImageIndex: 0,
    reviewStatus: null,
    rejectReason: '',
    isProcessing: false
  },

  onLoad: function(options) {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    const itemId = options.id;
    if (itemId) {
      this.loadDetail(itemId);
    }
  },

  loadDetail: function(taskId) {
    wx.showLoading({ title: '加载中...' });

    auditAPI.getAuditDetail(taskId).then(res => {
      if (res) {
        const publisher = res.publisher || {};
        let avatarText = 'U';
        if (publisher.name && publisher.name.trim()) {
          avatarText = publisher.name.trim().charAt(0).toUpperCase();
        }
        
        res.publisher = {
          ...publisher,
          avatarText: avatarText
        };
        res.submittedAt = format.formatRelativeTime(res.submittedAt);
        res.reviewedAt = format.formatRelativeTime(res.reviewedAt);
        res.exchangeMethod = this.formatExchangeMethod(res.exchangeMethod);
        res.location = parseLocation(res.location);
        res.publisher = res.publisher || {};
        res.contact = res.contact || {};
        res.images = res.images || [];
        res.tags = res.tags || [];
        
        this.setData({
          detail: res,
          currentImageIndex: 0
        });
      }
    }).catch(err => {
      console.error('加载审核详情失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  handlePrevImage: function() {
    const currentIndex = this.data.currentImageIndex;
    const imagesLength = this.data.detail.images?.length || 0;
    const newIndex = currentIndex === 0 ? imagesLength - 1 : currentIndex - 1;
    this.setData({ currentImageIndex: newIndex });
  },

  handleNextImage: function() {
    const currentIndex = this.data.currentImageIndex;
    const imagesLength = this.data.detail.images?.length || 0;
    const newIndex = (currentIndex + 1) % imagesLength;
    this.setData({ currentImageIndex: newIndex });
  },

  handleSelectImage: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentImageIndex: index });
  },

  goBack: function() {
    wx.navigateBack();
  },

  formatExchangeMethod: function(method) {
    const methodMap = {
      'sell': '出售',
      'swap': '交换',
      'give': '赠送',
      'rent': '租赁'
    };
    return methodMap[method] || method;
  },

  setReviewStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 
      reviewStatus: status,
      rejectReason: ''
    });
  },

  onRejectReasonChange: function(e) {
    this.setData({
      rejectReason: e.detail.value
    });
  },

  handleSubmitReview: function() {
    const { reviewStatus, rejectReason, detail } = this.data;

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
    wx.showLoading({ title: '处理中...' });

    auditAPI.submitAuditResult(detail.id, reviewStatus === 'approve', rejectReason).then(res => {
      wx.hideLoading();
      this.setData({
        isProcessing: false,
        'detail.status': reviewStatus === 'approve' ? 'approved' : 'rejected',
        'detail.reviewedAt': '刚刚'
      });

      wx.showToast({
        title: reviewStatus === 'approve' ? '已通过' : '已拒绝',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isProcessing: false });
      wx.showToast({
        title: err?.message || '审核失败',
        icon: 'none'
      });
    });
  },

  navigateToMap: function() {
    const { location, latitude, longitude } = this.data.detail;
    
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: '交易地点',
      address: location.address,
      scale: 15
    });
  },

  copyPhone: function() {
    const { phone } = this.data.detail.contact || {};
    if (!phone) {
      wx.showToast({
        title: '暂无手机号',
        icon: 'none'
      });
      return;
    }
    wx.setClipboardData({
      data: phone,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  copyWechat: function() {
    const { wechat } = this.data.detail.contact || {};
    if (!wechat) {
      wx.showToast({
        title: '暂无微信号',
        icon: 'none'
      });
      return;
    }
    wx.setClipboardData({
      data: wechat,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  }
});
