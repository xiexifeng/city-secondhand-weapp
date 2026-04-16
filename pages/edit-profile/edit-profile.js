Page({
  data: {
    profile: {
      nickname: '用户昵称',
      bio: '热爱生活，热爱分享',
      location: '北京市 朝阳区',
      phone: '13800138000',
      email: 'user@example.com'
    }
  },

  onLoad: function() {
    // Load user profile
  },

  /**
   * Handle input change
   */
  handleChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`profile.${field}`]: value
    });
  },

  /**
   * Change avatar
   */
  changeAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showToast({
          title: '头像上传功能开发中',
          icon: 'none'
        });
      }
    });
  },

  /**
   * Select location
   */
  selectLocation: function() {
    wx.showToast({
      title: '地区选择功能开发中',
      icon: 'none'
    });
  },

  /**
   * Handle save
   */
  handleSave: function() {
    const { profile } = this.data;

    // Validation
    if (!profile.nickname.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'error'
      });
      return;
    }

    if (!profile.phone.trim()) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'error'
      });
      return;
    }

    if (!profile.email.trim()) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'error'
      });
      return;
    }

    // Simulate save
    wx.showLoading({
      title: '保存中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // Navigate back to profile
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  }
});
