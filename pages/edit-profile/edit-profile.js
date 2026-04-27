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
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    // Load user profile
    this.getUserInfo();
  },
  
  /**
   * Get user info from API
   */
  getUserInfo: function() {
    wx.showLoading({
      title: '加载中...'
    });
    
    const api = require('../../utils/api');
    api.userAPI.getUserInfo()
      .then(res => {
        wx.hideLoading();
        
        // Update profile data
        this.setData({
          profile: {
            nickname: res.nickname || '用户昵称',
            bio: res.bio || '',
            location: res.location || '广东省深圳市',
            phone: res.phone || '',
            email: res.email || '',
            wechat: res.wechat || ''
          }
        });
        
        // Update avatar text
        this.updateAvatarText();
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      });
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

    // Prepare update data
    const updateData = {
      nickname: profile.nickname,
      bio: profile.bio,
      location: profile.location,
      wechat: profile.wechat,
      phone: profile.phone,
      email: profile.email
    };

    // Call API to update user info
    wx.showLoading({
      title: '保存中...'
    });

    const api = require('../../utils/api');
    api.userAPI.updateUserInfo(updateData)
      .then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // Navigate back to profile
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      });
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  }
});
