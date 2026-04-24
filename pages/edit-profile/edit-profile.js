Page({
  data: {
    profile: {
      nickname: '用户昵称',
      bio: '热爱生活，热爱分享',
      location: '北京市 朝阳区',
      phone: '13800138000',
      email: 'user@example.com',
      wechat: ''
    },
    avatarText: 'U',
    region: ['北京市', '北京市', '朝阳区']
  },

  onLoad: function() {
    // Load user profile
    this.updateAvatarText();
  },

  /**
   * Update avatar text based on nickname
   */
  updateAvatarText: function() {
    const { nickname } = this.data.profile;
    let avatarText = 'U';
    if (nickname && nickname.trim()) {
      avatarText = nickname.trim().charAt(0).toUpperCase();
    }
    this.setData({
      avatarText: avatarText
    });
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
    
    // Update avatar text when nickname changes
    if (field === 'nickname') {
      this.updateAvatarText();
    }
  },



  /**
   * Handle region change
   */
  onRegionChange: function(e) {
    const region = e.detail.value;
    const location = region.join(' ');
    this.setData({
      region: region,
      'profile.location': location
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
