Page({
  data: {
    activeTab: 'followers',
    followersList: [
      {
        id: 1,
        name: '张三',
        avatarText: '张',
        level: 'active',
        levelIcon: '⭐',
        status: '活跃用户',
        isFollowing: true
      },
      {
        id: 2,
        name: '李四',
        avatarText: '李',
        level: 'new',
        levelIcon: '🌱',
        status: '新用户',
        isFollowing: false
      },
      {
        id: 3,
        name: '王五',
        avatarText: '王',
        level: 'vip',
        levelIcon: '👑',
        status: 'VIP用户',
        isFollowing: true
      },
      {
        id: 4,
        name: '赵六',
        avatarText: '赵',
        level: 'active',
        levelIcon: '⭐',
        status: '活跃用户',
        isFollowing: false
      },
      {
        id: 5,
        name: '孙七',
        avatarText: '孙',
        level: 'new',
        levelIcon: '🌱',
        status: '新用户',
        isFollowing: true
      },
      {
        id: 6,
        name: '周八',
        avatarText: '周',
        level: 'active',
        levelIcon: '⭐',
        status: '活跃用户',
        isFollowing: false
      }
    ],
    followingList: [
      {
        id: 1,
        name: '赵六',
        avatarText: '赵',
        level: 'active',
        levelIcon: '⭐',
        status: '活跃用户'
      },
      {
        id: 2,
        name: '孙七',
        avatarText: '孙',
        level: 'new',
        levelIcon: '🌱',
        status: '新用户'
      },
      {
        id: 3,
        name: '周八',
        avatarText: '周',
        level: 'active',
        levelIcon: '⭐',
        status: '活跃用户'
      },
      {
        id: 4,
        name: '吴九',
        avatarText: '吴',
        level: 'vip',
        levelIcon: '👑',
        status: 'VIP用户'
      },
      {
        id: 5,
        name: '郑十',
        avatarText: '郑',
        level: 'active',
        levelIcon: '⭐',
        status: '活跃用户'
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