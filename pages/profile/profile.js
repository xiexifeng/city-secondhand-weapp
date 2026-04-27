Page({
  data: {
    user: {
      nickname: '用户昵称',
      followers: 24,
      following: 12,
      avatar: ''
    },
    userStats: {
      published: 12,
      wishes: 3,
      favorites: 24,
      points: 185,
      level: 'active',
      levelIcon: '',
      levelLabel: '',
      joinDate: '2024-01-15'
    },
    publishData: {
      items: {
        count: 12,
        views: 284,
        viewsTrend: 45,
        interested: 23,
        interestedTrend: 8,
        collected: 15,
        collectedTrend: 3
      },
      wishes: {
        count: 3,
        views: 156,
        viewsTrend: 25,
        interested: 18,
        interestedTrend: 5,
        collected: 10,
        collectedTrend: 2
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
    // 检查登录状态
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
    
    // Get user info from API
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
        
        // Update user info
        this.setData({
          user: {
            nickname: res.nickname || '用户昵称',
            followers: res.followers || 0,
            following: res.following || 0,
            avatar: res.avatarUrl || ''
          }
        });
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
      title: '主题切换功能开发中',
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
      title: '功能开发中',
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
          wx.clearStorage();
          wx.redirectTo({
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
    wx.navigateTo({
      url: '/pages/follow-list/follow-list?tab=followers'
    });
  },

  /**
   * Navigate to following list
   */
  navigateToFollowing: function() {
    wx.navigateTo({
      url: '/pages/follow-list/follow-list?tab=following'
    });
  }

});
