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
    wx.showToast({
      title: '实名认证功能开发中',
      icon: 'none'
    });
  },

  /**
   * Navigate to privacy
   */
  navigateToPrivacy: function() {
    wx.showToast({
      title: '隐私设置功能开发中',
      icon: 'none'
    });
  },

  /**
   * Navigate to security
   */
  navigateToSecurity: function() {
    wx.showToast({
      title: '密码和安全功能开发中',
      icon: 'none'
    });
  },

  /**
   * Navigate to about
   */
  navigateToAbout: function() {
    wx.showToast({
      title: '关于我们功能开发中',
      icon: 'none'
    });
  },

  /**
   * Navigate to terms
   */
  navigateToTerms: function() {
    wx.showToast({
      title: '使用条款功能开发中',
      icon: 'none'
    });
  },

  /**
   * Navigate to privacy policy
   */
  navigateToPrivacyPolicy: function() {
    wx.showToast({
      title: '隐私政策功能开发中',
      icon: 'none'
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
