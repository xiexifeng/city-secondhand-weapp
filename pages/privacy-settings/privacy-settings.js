Page({
  data: {
    settings: {
      profilePublic: true,
      showLocation: true,
      showContact: true,
      allowRecommendations: true
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
    this.loadSettings();
  },

  /**
   * Load settings from storage
   */
  loadSettings: function() {
    try {
      const savedSettings = wx.getStorageSync('privacySettings');
      if (savedSettings) {
        this.setData({
          settings: savedSettings
        });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  },

  /**
   * Toggle setting
   */
  toggleSetting: function(e) {
    const key = e.currentTarget.dataset.key;
    const currentValue = this.data.settings[key];
    this.setData({
      [`settings.${key}`]: !currentValue
    });
  },

  /**
   * Save settings
   */
  saveSettings: function() {
    try {
      wx.setStorageSync('privacySettings', this.data.settings);
      wx.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    } catch (e) {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  }
});
