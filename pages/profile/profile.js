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
        matches: 8,
        followers: 5,
        newRecommendations: 2
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
    this.initData();
  },

  /**
   * Initialize page data
   */
  initData: function() {
    // Data is already initialized in data object
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
  }

});
