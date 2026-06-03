const { auditAPI } = require('../../utils/api');
const format = require('../../utils/format.js');

Page({
  data: {
    filterStatus: 'pending',
    items: [],
    filteredItems: [],
    stats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalReviewed: 0,
      totalPoints: 0
    },
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false
  },

  onLoad: function() {
    const app = getApp();
    if (!app.requireLogin()) return;
    this.loadAuditList();
  },

  loadAuditList: function() {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    auditAPI.getAuditList({
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize,
      status: this.data.filterStatus
    }).then(res => {
      if (res && res.items) {
        const formattedItems = res.items.map(item => {
          const publisher = item.publisher || {};
          let avatarText = 'U';
          if (publisher.name && publisher.name.trim()) {
            avatarText = publisher.name.trim().charAt(0).toUpperCase();
          }
          return {
            ...item,
            submittedAt: format.formatRelativeTime(item.submittedAt),
            publisher: {
              ...publisher,
              avatarText: avatarText
            }
          };
        });
        const newItems = this.data.pageNo === 1 ? formattedItems : [...this.data.items, ...formattedItems];
        this.setData({
          items: newItems,
          hasMore: res.items.length >= this.data.pageSize,
          stats: res.stats || {
            pending: 0,
            approved: 0,
            rejected: 0,
            totalReviewed: 0,
            totalPoints: 0
          }
        });
        this.computeStats();
      }
    }).catch(err => {
      console.error('加载审核列表失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }).finally(() => {
      this.setData({ isLoading: false });
    });
  },

  setFilterStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ 
      filterStatus: status,
      pageNo: 1,
      hasMore: true,
      items: []
    });
    this.loadAuditList();
  },

  computeStats: function() {
    const items = this.data.items;

    const filteredItems = this.data.filterStatus === 'all' 
      ? items 
      : items.filter(i => i.status === this.data.filterStatus);

    this.setData({
      filteredItems: filteredItems
    });
  },

  navigateToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/moderation-detail/moderation-detail?id=${id}`
    });
  },

  onPullDownRefresh: function() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      items: []
    });
    this.loadAuditList();
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({ pageNo: this.data.pageNo + 1 });
      this.loadAuditList();
    }
  },

  onShow: function() {
    const app = getApp();
    if (!app.requireLogin()) return;
    this.setData({
      pageNo: 1,
      hasMore: true,
      items: []
    });
    this.loadAuditList();
  }
});
