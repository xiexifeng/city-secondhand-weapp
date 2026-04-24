Page({
  data: {
    totalPoints: 185,
    pointsHistory: [
      {
        id: 1,
        title: '发布物品',
        time: '2026-04-23 14:30',
        points: 10,
        type: 'earn',
        icon: '📦'
      },
      {
        id: 2,
        title: '邀请好友注册',
        time: '2026-04-22 09:15',
        points: 100,
        type: 'earn',
        icon: '👥'
      },
      {
        id: 3,
        title: '每日签到',
        time: '2026-04-21 08:00',
        points: 5,
        type: 'earn',
        icon: '📅'
      },
      {
        id: 4,
        title: '获得感兴趣',
        time: '2026-04-20 16:45',
        points: 5,
        type: 'earn',
        icon: '❤️'
      },
      {
        id: 5,
        title: '兑换优惠券',
        time: '2026-04-19 11:20',
        points: -50,
        type: 'spend',
        icon: '🎫'
      },
      {
        id: 6,
        title: '发布求换',
        time: '2026-04-18 10:30',
        points: 8,
        type: 'earn',
        icon: '🔄'
      },
      {
        id: 7,
        title: '完成周任务',
        time: '2026-04-17 18:00',
        points: 30,
        type: 'earn',
        icon: '✅'
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
    // 页面加载时的初始化
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});