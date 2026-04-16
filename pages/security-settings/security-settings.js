Page({
  data: {
    security: {
      phoneBound: true,
      phone: '138****1234',
      emailBound: false,
      email: '',
      twoFactorEnabled: false
    }
  },

  onLoad: function() {
    this.loadSecuritySettings();
  },

  /**
   * Load security settings
   */
  loadSecuritySettings: function() {
    try {
      const savedSettings = wx.getStorageSync('securitySettings');
      if (savedSettings) {
        this.setData({
          security: savedSettings
        });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  },

  /**
   * Handle phone binding
   */
  handlePhoneBinding: function() {
    wx.showModal({
      title: this.data.security.phoneBound ? '更换手机号' : '绑定手机号',
      content: '请输入新的手机号码',
      editable: true,
      placeholderText: '请输入手机号',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'security.phoneBound': true,
            'security.phone': res.content.substring(0, 3) + '****' + res.content.substring(7)
          });
          this.saveSecuritySettings();
          wx.showToast({
            title: '手机号已' + (this.data.security.phoneBound ? '更换' : '绑定'),
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * Handle email binding
   */
  handleEmailBinding: function() {
    wx.showModal({
      title: this.data.security.emailBound ? '更换邮箱' : '绑定邮箱',
      content: '请输入邮箱地址',
      editable: true,
      placeholderText: '请输入邮箱',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'security.emailBound': true,
            'security.email': res.content
          });
          this.saveSecuritySettings();
          wx.showToast({
            title: '邮箱已' + (this.data.security.emailBound ? '更换' : '绑定'),
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * Handle change password
   */
  handleChangePassword: function() {
    wx.navigateTo({
      url: '/pages/change-password/change-password'
    });
  },

  /**
   * Handle two-factor auth
   */
  handleTwoFactorAuth: function() {
    const { twoFactorEnabled } = this.data.security;
    if (!twoFactorEnabled) {
      wx.showModal({
        title: '启用两步验证',
        content: '启用两步验证后，登录时需要输入验证码。确定要启用吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              'security.twoFactorEnabled': true
            });
            this.saveSecuritySettings();
            wx.showToast({
              title: '两步验证已启用',
              icon: 'success'
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: '关闭两步验证',
        content: '关闭两步验证会降低账户安全性。确定要关闭吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              'security.twoFactorEnabled': false
            });
            this.saveSecuritySettings();
            wx.showToast({
              title: '两步验证已关闭',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  /**
   * Save security settings
   */
  saveSecuritySettings: function() {
    try {
      wx.setStorageSync('securitySettings', this.data.security);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  /**
   * Handle logout
   */
  handleLogout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/home/home'
          });
          wx.showToast({
            title: '已退出登录',
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
  }
});
