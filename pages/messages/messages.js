Page({
  data: {
    messages: [],
    filteredMessages: [],
    activeFilter: 'all',
    selectedReport: null,
    reviewNote: '',
    unreadCount: 0,
    reportCount: 0,
    moderationCount: 0,
    pendingReportCount: 0
  },

  onLoad: function() {
    this.initMessages();
  },

  /**
   * 初始化消息数据
   */
  initMessages: function() {
    // Mock数据 - 系统消息
    const systemMessages = [
      {
        id: 'msg-1',
        type: 'system',
        title: '欢迎使用换换',
        description: '感谢您的使用，如有问题请随时联系我们',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'msg-2',
        type: 'activity',
        title: '您有新的浏览者',
        description: '您发布的 iPhone 14 Pro Max 被 5 人浏览',
        read: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-3',
        type: 'activity',
        title: '您的物品被收藏',
        description: 'MacBook Pro 13 被 2 人收藏',
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    // Mock数据 - 举报消息
    const reportMessages = [
      {
        id: 'report-1',
        type: 'report',
        title: '物品举报：iPhone 14 Pro Max',
        description: '用户举报该物品信息不符',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        report: {
          id: 'report-1',
          type: 'item',
          targetName: 'iPhone 14 Pro Max',
          reason: '信息不符',
          description: '物品实际成色与描述不符，卖家虚假宣传',
          evidence: [],
          status: '待审核',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          reviewerNote: ''
        }
      },
      {
        id: 'report-2',
        type: 'report',
        title: '用户投诉：李明',
        description: '用户反映交易中存在欺诈行为',
        read: true,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        report: {
          id: 'report-2',
          type: 'user',
          targetName: '李明',
          reason: '欺诈行为',
          description: '卖家收款后未发货，已3天未回应',
          evidence: [],
          status: '有效',
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          reviewerNote: '已确认欺诈，已禁用账号'
        }
      }
    ];

    const allMessages = [...reportMessages, ...systemMessages];
    
    this.setData({
      messages: allMessages
    });

    this.updateStats();
    this.filterMessages();
  },

  /**
   * 更新统计数据
   */
  updateStats: function() {
    const { messages } = this.data;
    const unreadCount = messages.filter(m => !m.read).length;
    const reportCount = messages.filter(m => m.type === 'report').length;
    const moderationCount = messages.filter(m => m.type === 'moderation').length;
    const pendingReportCount = messages.filter(
      m => m.type === 'report' && m.report && m.report.status === '待审核'
    ).length;

    this.setData({
      unreadCount,
      reportCount,
      moderationCount,
      pendingReportCount
    });
  },

  /**
   * 筛选消息
   */
  filterMessages: function() {
    const { messages, activeFilter } = this.data;
    let filtered = messages;

    if (activeFilter === 'unread') {
      filtered = messages.filter(m => !m.read);
    } else if (activeFilter === 'report') {
      filtered = messages.filter(m => m.type === 'report');
    } else if (activeFilter === 'moderation') {
      filtered = messages.filter(m => m.type === 'moderation');
    }

    this.setData({ filteredMessages: filtered });
  },

  /**
   * 设置活跃筛选器
   */
  setActiveFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.filterMessages();
  },

  /**
   * 处理消息点击
   */
  handleMessageClick: function(e) {
    const { id, type, reportId } = e.currentTarget.dataset;
    
    // 标记为已读
    this.markAsRead(id);

    // 如果是举报消息，打开详情弹窗
    if (type === 'report' && reportId) {
      const { messages } = this.data;
      const message = messages.find(m => m.id === id);
      if (message && message.report) {
        this.setData({ selectedReport: message.report });
      }
    }
  },

  /**
   * 标记消息为已读
   */
  markAsRead: function(id) {
    const { messages } = this.data;
    const updated = messages.map(m => 
      m.id === id ? { ...m, read: true } : m
    );
    this.setData({ messages: updated });
    this.updateStats();
    this.filterMessages();
  },

  /**
   * 删除消息
   */
  deleteMessage: function(e) {
    const id = e.currentTarget.dataset.id;
    const { messages } = this.data;
    const filtered = messages.filter(m => m.id !== id);
    
    this.setData({ messages: filtered });
    this.updateStats();
    this.filterMessages();

    wx.showToast({
      title: '消息已删除',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 关闭举报详情弹窗
   */
  closeReportModal: function() {
    this.setData({
      selectedReport: null,
      reviewNote: ''
    });
  },

  /**
   * 更新审核备注
   */
  updateReviewNote: function(e) {
    this.setData({ reviewNote: e.detail.value });
  },

  /**
   * 处理举报审核
   */
  handleReviewReport: function(e) {
    const status = e.currentTarget.dataset.status;
    const { selectedReport, reviewNote, messages } = this.data;

    if (!selectedReport) return;

    // 更新消息中的举报状态
    const updated = messages.map(m => {
      if (m.id === selectedReport.id) {
        return {
          ...m,
          report: {
            ...m.report,
            status: status,
            reviewerNote: reviewNote
          }
        };
      }
      return m;
    });

    this.setData({
      messages: updated,
      selectedReport: null,
      reviewNote: ''
    });

    this.updateStats();
    this.filterMessages();

    wx.showToast({
      title: `举报已标记为"${status}"`,
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * Get status class name for styling
   */
  getStatusClass: function(status) {
    const statusMap = {
      '待审核': 'pending',
      '有效': 'valid',
      '无效': 'invalid',
      '已处理': 'handled'
    };
    return statusMap[status] || 'pending';
  },

  /**
   * Format date
   */
  formatDate: function(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  /**
   * 返回首页
   */
  handleBack: function() {
    wx.navigateBack();
  }
});
