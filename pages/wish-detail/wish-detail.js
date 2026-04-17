// pages/wish-detail/wish-detail.js

const mockWishes = [
  {
    id: 1,
    title: '求购 iPhone 15 Pro',
    description: '预算2000元以内，或用我的旧Switch换',
    category: '数码3C',
    budget: '2000元以内',
    distance: 1.2,
    time: '2小时前',
    userName: '小明',
    verified: true,
    active: true
  },
  {
    id: 2,
    title: '求换 MacBook Pro',
    description: '用我的iPad Air + 差价换，或者积分',
    category: '数码3C',
    budget: '差价1000-2000',
    distance: 0.8,
    time: '30分钟前',
    userName: '李女士',
    verified: true,
    active: true
  },
  {
    id: 3,
    title: '求购 Sony A7IV 相机',
    description: '新手摄影爱好者，预算5000-6000',
    category: '摄影器材',
    budget: '5000-6000元',
    distance: 2.5,
    time: '1小时前',
    userName: '摄影师王',
    verified: false,
    active: true
  },
  {
    id: 4,
    title: '求换 PS5 游戏机',
    description: '用我的Nintendo Switch + 现金换',
    category: '游戏',
    budget: '差价500-800',
    distance: 3.1,
    time: '3小时前',
    userName: '游戏玩家',
    verified: true,
    active: true
  },
  {
    id: 5,
    title: '求购 自行车',
    description: '山地车或公路车，要求成色好',
    category: '运动户外',
    budget: '1000-2000元',
    distance: 0.5,
    time: '5分钟前',
    userName: '骑行爱好者',
    verified: true,
    active: true
  },
  {
    id: 6,
    title: '求换 iPad Pro',
    description: '用我的MacBook Air + 现金差价换',
    category: '数码3C',
    budget: '差价2000-3000',
    distance: 1.8,
    time: '45分钟前',
    userName: '科技爱好者',
    verified: true,
    active: true
  },
  {
    id: 7,
    title: '求购 Canon 单反相机',
    description: '全画幅相机，预算8000-10000',
    category: '摄影器材',
    budget: '8000-10000元',
    distance: 2.2,
    time: '1.5小时前',
    userName: '摄影初学者',
    verified: false,
    active: false
  },
  {
    id: 8,
    title: '求换 Nintendo Switch',
    description: '用我的PS4 + 差价换',
    category: '游戏',
    budget: '差价800-1200',
    distance: 0.3,
    time: '20分钟前',
    userName: '游戏迷',
    verified: true,
    active: true
  },
  {
    id: 9,
    title: '求购 Airpods Pro',
    description: '最新款，预算1500元以内',
    category: '数码3C',
    budget: '1500元以内',
    distance: 1.5,
    time: '1小时前',
    userName: '上班族',
    verified: true,
    active: true
  },
  {
    id: 10,
    title: '求换 Rolex 手表',
    description: '用我的Omega + 差价换',
    category: '奢侈品',
    budget: '差价5000-8000',
    distance: 4.2,
    time: '2小时前',
    userName: '表迷',
    verified: true,
    active: false
  }
];

Page({
  data: {
    wish: null,
    showReport: false
  },

  onLoad: function(options) {
    const wishId = parseInt(options.id);
    const wish = mockWishes.find(w => w.id === wishId);
    
    if (wish) {
      this.setData({ wish: wish });
    } else {
      wx.showToast({
        title: '心愿不存在',
        icon: 'error',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * Show report modal
   */
  showReportModal: function() {
    this.setData({ showReport: true });
  },

  /**
   * Hide report modal
   */
  hideReportModal: function() {
    this.setData({ showReport: false });
  },

  /**
   * Prevent modal close when clicking on modal content
   */
  preventClose: function() {
    // Do nothing - prevent event bubbling
  },

  /**
   * Submit report
   */
  submitReport: function(e) {
    const reason = e.currentTarget.dataset.reason;
    wx.showToast({
      title: '举报成功',
      icon: 'success',
      duration: 2000
    });
    this.setData({ showReport: false });
  },

  /**
   * Contact seller
   */
  contactSeller: function() {
    wx.showToast({
      title: '联系发布者',
      icon: 'none',
      duration: 2000
    });
    // In a real app, this would navigate to a chat page
    // wx.navigateTo({
    //   url: `/pages/chat/chat?userId=${this.data.wish.userId}`
    // });
  }
});
