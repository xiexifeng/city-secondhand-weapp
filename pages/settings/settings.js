Page({
  data: {
    settingItems: [
      {
        id: 'profile',
        title: '个人信息',
        description: '编辑昵称、头像、个人简介',
        icon: '✏️',
        action: 'navigateToEditProfile'
      },
      {
        id: 'realname',
        title: '实名认证',
        description: '完成实名认证提升信任度',
        icon: '🛡️',
        action: 'navigateToRealname'
      },
      {
        id: 'privacy',
        title: '隐私设置',
        description: '控制个人信息的可见性',
        icon: '🔒',
        action: 'navigateToPrivacy'
      },
      {
        id: 'password',
        title: '密码和安全',
        description: '修改密码、绑定手机、两步验证',
        icon: '🔐',
        action: 'navigateToSecurity'
      }
    ]
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
    // Page loaded
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * Navigate to edit profile
   */
  navigateToEditProfile: function() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    });
  },

  /**
   * Navigate to realname
   */
  navigateToRealname: function() {
    wx.navigateTo({
      url: '/pages/real-name-auth/real-name-auth'
    });
  },

  /**
   * Navigate to privacy
   */
  navigateToPrivacy: function() {
    wx.navigateTo({
      url: '/pages/privacy-settings/privacy-settings'
    });
  },

  /**
   * Navigate to security
   */
  navigateToSecurity: function() {
    wx.navigateTo({
      url: '/pages/security-settings/security-settings'
    });
  },

  /**
   * Navigate to about
   */
  navigateToAbout: function() {
    wx.navigateTo({
      url: '/pages/about-us/about-us'
    });
  },

  /**
   * Navigate to terms
   */
  navigateToTerms: function() {
    wx.navigateTo({
      url: '/pages/terms-of-service/terms-of-service'
    });
  },

  /**
   * Navigate to privacy policy
   */
  navigateToPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy'
    });
  },

  /**
   * Handle logout
   */
  handleLogout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage();
          wx.redirectTo({
            url: '/pages/home/home'
          });
        }
      }
    });
  }
});
