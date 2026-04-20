Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    item: {
      type: Object,
      value: {}
    }
  },
  
  data: {
    reportReasons: [
      { id: 1, title: '虚假物品', description: '物品不存在或与描述严重不符' },
      { id: 2, title: '信息误导', description: '物品描述虚假或图片与实物不符' },
      { id: 3, title: '违禁物品', description: '发布法律法规禁止的物品' },
      { id: 4, title: '侵权行为', description: '侵犯他人知识产权或肖像权' },
      { id: 5, title: '垃圾广告', description: '发布与二手交易无关的广告信息' },
      { id: 6, title: '其他原因', description: '其他违反平台规定的行为' }
    ],
    selectedReason: null,
    reportDescription: '',
    uploadedEvidence: []
  },
  
  methods: {
    // 关闭举报模态框
    closeReport: function() {
      this.setData({
        selectedReason: null,
        reportDescription: '',
        uploadedEvidence: []
      });
      this.triggerEvent('close');
    },

    // 选择举报原因
    selectReason: function(e) {
      const reasonId = e.currentTarget.dataset.id;
      this.setData({ selectedReason: reasonId });
    },

    // 输入详细描述
    onReportDescriptionInput: function(e) {
      this.setData({ reportDescription: e.detail.value });
    },

    // 上传证据
    uploadEvidence: function() {
      const that = this;
      wx.chooseImage({
        count: 5 - that.data.uploadedEvidence.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          const tempFilePaths = res.tempFilePaths;
          const uploadedEvidence = that.data.uploadedEvidence.concat(tempFilePaths);
          that.setData({ uploadedEvidence: uploadedEvidence.slice(0, 5) });
        }
      });
    },

    // 预览图片
    previewImage: function(e) {
      const index = e.currentTarget.dataset.index;
      const { uploadedEvidence } = this.data;
      wx.previewImage({
        current: uploadedEvidence[index],
        urls: uploadedEvidence
      });
    },

    // 移除图片
    removeImage: function(e) {
      const index = e.currentTarget.dataset.index;
      const { uploadedEvidence } = this.data;
      uploadedEvidence.splice(index, 1);
      this.setData({ uploadedEvidence });
    },

    // 提交举报
    submitReport: function() {
      const { selectedReason, reportDescription, uploadedEvidence, item } = this.data;
      
      // 验证必填项
      if (!selectedReason || !reportDescription) {
        wx.showToast({
          title: '请填写举报原因和详细描述',
          icon: 'none'
        });
        return;
      }
      
      // 这里可以添加实际的举报逻辑，如调用API
      console.log('提交举报:', {
        itemId: item.id,
        reasonId: selectedReason,
        description: reportDescription,
        evidence: uploadedEvidence
      });
      
      // 模拟举报成功
      wx.showToast({
        title: '举报成功',
        icon: 'success',
        duration: 1500
      });
      
      // 关闭模态框并重置表单
      this.closeReport();
    }
  }
});