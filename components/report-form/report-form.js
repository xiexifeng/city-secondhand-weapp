const { reportAPI } = require('../../utils/api');

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    item: {
      type: Object,
      value: {}
    },
    reportType: {
      type: Number,
      value: 1
    }
  },

  data: {
    reportReasons: [
      { id: 1, title: '虚假物品', description: '物品不存在或与描述严重不符' },
      { id: 2, title: '信息误导', description: '物品描述虚假或图片与实物不符' },
      { id: 3, title: '违禁物品', description: '发布法律法规禁止的物品' },
      { id: 4, title: '侵权行为', description: '侵犯他人知识产权或肖像权' },
      { id: 5, title: '垃圾广告', description: '发布与二手交换无关的广告信息' },
      { id: 6, title: '其他原因', description: '其他违反平台规定的行为' }
    ],
    selectedReason: null,
    reportDescription: '',
    uploadedEvidence: [],
    uploadingImages: false,
    isLoggedIn: false
  },

  observers: {
    'visible': function(visible) {
      if (visible) {
        const app = getApp();
        this.setData({ isLoggedIn: app.isLoggedIn() });
      }
    }
  },

  methods: {
    preventTouchMove: function() {
      return;
    },

    allowTouchMove: function() {
      return;
    },

    closeReport: function() {
      this.setData({
        selectedReason: null,
        reportDescription: '',
        uploadedEvidence: [],
        uploadingImages: false
      });
      this.triggerEvent('close');
    },

    selectReason: function(e) {
      const reasonId = e.currentTarget.dataset.id;
      this.setData({ selectedReason: reasonId });
    },

    onReportDescriptionInput: function(e) {
      this.setData({ reportDescription: e.detail.value });
    },

    handleEvidenceChange: function(e) {
      this.setData({ uploadedEvidence: e.detail.images });
    },

    submitReport: function() {
      const { selectedReason, reportDescription, uploadedEvidence, item, reportType } = this.data;

      if (!selectedReason || !reportDescription) {
        wx.showToast({
          title: '请填写举报原因和详细描述',
          icon: 'none'
        });
        return;
      }

      if (!item || !item.id) {
        wx.showToast({
          title: '举报对象不存在',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({ title: '提交中...' });

      const reasonTitle = this.data.reportReasons.find(r => r.id === selectedReason)?.title || '其他原因';

      reportAPI.submitReport(reportType, item.id, reasonTitle, reportDescription, uploadedEvidence)
        .then(res => {
          wx.hideLoading();
          if (res && res.success) {
            wx.showToast({
              title: '举报成功',
              icon: 'success',
              duration: 1500
            });
            this.closeReport();
          } else {
            wx.showToast({
              title: '举报失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error('提交举报失败:', err);
          wx.showToast({
            title: '举报失败，请稍后重试',
            icon: 'none'
          });
        });
    }
  }
});