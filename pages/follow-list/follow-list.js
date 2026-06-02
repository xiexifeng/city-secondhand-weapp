Page({
  data: {
    activeTab: 'followers',
    followersList: [
      {
        id: 1,
        name: '',
        avatarText: '',
        level: 'active',
        levelIcon: '⭐',
        status: '',
        isFollowing: true
      },
      {
        id: 2,
        name: '',
        avatarText: '',
        level: 'new',
        levelIcon: '🌱',
        status: '',
        isFollowing: false
      },
      {
        id: 3,
        name: '',
        avatarText: '',
        level: 'vip',
        levelIcon: '👑',
        status: '',
        isFollowing: true
      },
      {
        id: 4,
        name: '',
        avatarText: '',
        level: 'active',
        levelIcon: '⭐',
        status: '',
        isFollowing: false
      },
      {
        id: 5,
        name: '',
        avatarText: '',
        level: 'new',
        levelIcon: '🌱',
        status: '',
        isFollowing: true
      },
      {
        id: 6,
        name: '',
        avatarText: '',
        level: 'active',
        levelIcon: '⭐',
        status: '',
        isFollowing: false
      }
    ],
    followingList: [
      {
        id: 1,
        name: '',
        avatarText: '',
        level: 'active',
        levelIcon: '⭐',
        status: ''
      },
      {
        id: 2,
        name: '',
        avatarText: '',
        level: 'new',
        levelIcon: '🌱',
        status: ''
      },
      {
        id: 3,
        name: '',
        avatarText: '',
        level: 'active',
        levelIcon: '⭐',
        status: ''
      },
      {
        id: 4,
        name: '',
        avatarText: '',
        level: 'vip',
        levelIcon: '👑',
        status: ''
      },
      {
        id: 5,
        name: '',
        avatarText: '',
        level: 'active',
        levelIcon: '⭐',
        status: ''
      }
    ]
  },

  onLoad: function(options) {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    // 根据URL参数设置初始tab
    if (options.tab) {
      this.setData({
        activeTab: options.tab
      });
    }
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * 切换tab
   */
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  /**
   * 切换关注状态
   */
  toggleFollow: function(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    
    if (type === 'followers') {
      // 直接修改数据，避免创建新数组
      const index = this.data.followersList.findIndex(item => item.id === id);
      if (index !== -1) {
        const newFollowersList = [...this.data.followersList];
        newFollowersList[index].isFollowing = !newFollowersList[index].isFollowing;
        this.setData({
          followersList: newFollowersList
        });
      }
    } else if (type === 'following') {
      // 直接修改数据，避免创建新数组
      const newFollowingList = this.data.followingList.filter(item => item.id !== id);
      this.setData({
        followingList: newFollowingList
      });
    }
  }
});