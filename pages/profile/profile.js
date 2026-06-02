Page({
  data: {
    user: {
      nickname: '用户昵称',
      followers: 0,
      following: 0,
      avatar: ''
    },
    userId: '',  // 当前用户ID（用于邀请分享）
    userStats: {
      published: 0,
      wishes: 0,
      favorites: 0,
      points: 0,
      level: 'active',
      levelIcon: '',
      levelLabel: '',
      joinDate: '2024-01-15'
    },
    publishData: {
      items: {
        count: 0,
        views: 0,
        viewsTrend: 0,
        interested: 0,
        interestedTrend: 0,
        collected: 0,
        collectedTrend: 0
      },
      wishes: {
        count: 0,
        views: 0,
        viewsTrend: 0,
        interested: 0,
        interestedTrend: 0,
        collected: 0,
        collectedTrend: 0
      }
    },
    weeklyTasks: [
      {
        id: 1,
        title: '发布3个物品',
        description: '每发布1个物品获得10积分',
        current: 3,
        target: 3,
        reward: 30,
        completed: true
      },
      {
        id: 2,
        title: '获得10个感兴趣',
        description: '每获得1个感兴趣获得5积分',
        current: 5,
        target: 10,
        reward: 50,
        completed: false
      },
      {
        id: 3,
        title: '邀请1个好友',
        description: '成功邀请1个好友获得100积分',
        current: 0,
        target: 1,
        reward: 100,
        completed: false
      }
    ],
    discoverItems: [
      {
        icon: '📍',
        label: '附近有什么新物品？',
        action: 'nearby'
      },
      {
        icon: '🔥',
        label: '热门物品排行',
        action: 'trending'
      },
      {
        icon: '💡',
        label: '推荐给你',
        action: 'recommend'
      },
      {
        icon: '✨',
        label: '最近很火的心愿',
        action: 'hot-wishes'
      }
    ]
  },

  onLoad: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    this.initData();
  },

  onShow: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    this.initData();
  },

  /**
   * Initialize page data
   */
  initData: function() {
    const level = this.data.userStats.level;
    const levelIcon = this.getLevelIcon(level);
    const levelLabel = this.getLevelLabel(level);
    
    this.setData({
      'userStats.levelIcon': levelIcon,
      'userStats.levelLabel': levelLabel
    });
    
    this.getUserInfo();
    this.getUserStatistics();
    this.getCollectionCount();
    this.getPointsAccount();
  },
  
  /**
   * Get user info from API
   */
  getUserInfo: function() {
    const api = require('../../utils/api');
    api.userAPI.getUserInfo()
      .then(res => {
        this.setData({
          userId: res.userId || '',
          user: {
            nickname: res.nickname || '用户昵称',
            followers: res.followers || 0,
            following: res.following || 0,
            avatar: res.avatarUrl || ''
          }
        });
        if (res.code && !res.success) {
          if(res.code === '010001'){
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
              duration: 1500
            });
            const app = getApp();
            app.globalData.token = null;
            app.globalData.userInfo = null;
            app.globalData.userPhone = null;
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('userPhone');
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/login/login'
              });
            }, 1500);
          }else{
            wx.showToast({
              title: '获取用户信息失败：' + res.desc,
              icon: 'none'
            });
          }
        }
      })
      .catch(err => {
        console.error('获取用户信息失败', err);
        wx.showToast({
            title: '获取用户信息失败,请稍后重试',
            icon: 'none'
          });
      });
  },

  /**
   * Get user statistics (publish and wish stats)
   */
  getUserStatistics: function() {
    const api = require('../../utils/api');
    api.userAPI.getUserStatistics()
      .then(res => {
        if (res.publish) {
          this.setData({
            'publishData.items': {
              count: res.publish.total || 0,
              views: res.publish.views || 0,
              interested: res.publish.interested || 0,
              collected: res.publish.collected || 0
            }
          });
        }
        if (res.wish) {
          this.setData({
            'publishData.wishes': {
              count: res.wish.total || 0,
              views: res.wish.views || 0,
              interested: res.wish.interested || 0,
              collected: res.wish.collected || 0
            }
          });
        }
      })
      .catch(err => {
        console.error('获取统计数据失败', err);
      });
  },

  /**
   * Get collection count
   */
  getCollectionCount: function() {
    const api = require('../../utils/api');
    api.collectionAPI.getCollectionCount()
      .then(res => {
        this.setData({
          'userStats.favorites': res.total || 0,
          'userStats.recent7DaysFavorites': res.recent7DaysCount || 0
        });
      })
      .catch(err => {
        console.error('获取收藏数量失败', err);
      });
  },

  /**
   * Get points account
   */
  getPointsAccount: function() {
    const api = require('../../utils/api');
    api.userAPI.getPointsAccount()
      .then(res => {
        this.setData({
          'userStats.points': res.pointsBalance ? Number(res.pointsBalance) : 0,
          'userStats.monthEarnDesc': res.monthEarnDesc || ''
        });
      })
      .catch(err => {
        console.error('获取积分失败', err);
      });
  },

  /**
   * Get level icon
   */
  getLevelIcon: function(level) {
    const icons = {
      'new': '🌱',
      'active': '⭐',
      'vip': '👑'
    };
    return icons[level] || '🌱';
  },

  /**
   * Get level label
   */
  getLevelLabel: function(level) {
    const labels = {
      'new': '新手',
      'active': '活跃',
      'vip': 'VIP'
    };
    return labels[level] || '新手';
  },

  /**
   * Toggle theme
   */
  toggleTheme: function() {
    wx.showToast({
      title: '该功能即将上线',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * Navigate to published items
   */
  navigateToPublished: function() {
    wx.navigateTo({
      url: '/pages/published-items/published-items'
    });
  },

  /**
   * Navigate to wishes
   */
  navigateToWishes: function() {
    wx.navigateTo({
      url: '/pages/wish-management/wish-management'
    });
  },

  /**
   * Navigate to tasks
   */
  navigateToTasks: function() {
    wx.showToast({
      title: '任务中心开发中',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * Navigate discover
   */
  navigateDiscover: function(e) {
    const action = e.currentTarget.dataset.action;
    wx.showToast({
      title: '该功能即将上线',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * Navigate to settings
   */
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  /**
   * Navigate to login
   */
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
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
          const api = require('../../utils/api');
          const app = getApp();
          api.userAPI.logout().catch(() => {});
          app.globalData.token = null;
          app.globalData.userInfo = null;
          app.globalData.userPhone = null;
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userPhone');
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  /**
   * Navigate to points detail
   */
  navigateToPoints: function() {
    wx.navigateTo({
      url: '/pages/points-detail/points-detail'
    });
  },

  /**
   * Navigate to favorites detail
   */
  navigateToFavorites: function() {
    wx.navigateTo({
      url: '/pages/favorites-detail/favorites-detail'
    });
  },

  /**
   * Navigate to followers list
   */
  navigateToFollowers: function() {
    wx.showToast({
      title: '该功能即将上线',
      icon: 'none'
    });
    // wx.navigateTo({
    //   url: '/pages/follow-list/follow-list?tab=followers'
    // });
  },

  /**
   * Navigate to following list
   */
  navigateToFollowing: function() {
    wx.showToast({
      title: '该功能即将上线',
      icon: 'none'
    });
    // wx.navigateTo({
    //   url: '/pages/follow-list/follow-list?tab=following'
    // });
  },

  /**
   * 分享到微信好友
   */
  onShareAppMessage: function() {
    const { userId, user } = this.data;
    const nickname = user.nickname || '用户';
    
    return {
      title: `🎉 ${nickname}邀请你加入换换么！`,
      desc: '闲置物品交换，环保又省钱',
      path: `/pages/login/login?inviterId=${userId}`,
      success: (res) => {
        console.log('分享成功', res);
      },
      fail: (err) => {
        console.log('分享失败', err);
      }
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function() {
    const { userId, user } = this.data;
    const nickname = user.nickname || '用户';
    
    return {
      title: `🎉 ${nickname}邀请您加入换换么！闲置物品交换，环保又省钱`,
      query: `inviterId=${userId}`
    };
  },

  /**
   * 主动触发分享（按钮点击）
   */
  handleInviteShare: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 分享给好友
          this.onShareAppMessage();
        } else if (res.tapIndex === 1) {
          // 分享到朋友圈
          this.onShareTimeline();
        }
      },
      fail: (err) => {
        console.log('取消分享', err);
      }
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    Promise.all([
      this.getUserInfo(),
      this.getUserStatistics(),
      this.getCollectionCount(),
      this.getPointsAccount()
    ]).then(() => {
      wx.stopPullDownRefresh();
    }).catch((err) => {
      console.error('刷新失败', err);
      wx.stopPullDownRefresh();
    });
  }

});
