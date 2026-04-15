// pages/publish/publish.js
Page({
  data: {
    images: [],
    title: '',
    description: '',
    tradeType: 'sell',
    price: '',
    location: '',
    condition: 'good'
  },

  onLoad() {
    // 页面加载
  },

  // 上传图片
  handleUploadImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          images: [...this.data.images, ...tempFilePaths].slice(0, 9)
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 删除图片
  handleDeleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  // 输入标题
  handleTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 输入描述
  handleDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 输入价格
  handlePriceInput(e) {
    this.setData({ price: e.detail.value });
  },

  // 选择交易方式
  handleTradeTypeChange(e) {
    const tradeType = e.currentTarget.dataset.type;
    this.setData({ tradeType });
  },

  // 选择成色
  handleConditionChange(e) {
    const condition = e.currentTarget.dataset.condition;
    this.setData({ condition });
  },

  // 选择位置
  handleSelectLocation() {
    wx.navigateTo({
      url: '/pages/location-picker/location-picker'
    });
  },

  // 发布
  handlePublish() {
    if (!this.data.title) {
      wx.showToast({
        title: '请输入物品名称',
        icon: 'none'
      });
      return;
    }

    if (this.data.tradeType === 'sell' && !this.data.price) {
      wx.showToast({
        title: '请输入价格',
        icon: 'none'
      });
      return;
    }

    wx.showToast({
      title: '发布成功',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 取消
  handleCancel() {
    wx.navigateBack();
  }
});
