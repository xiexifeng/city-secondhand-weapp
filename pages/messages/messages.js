const { messageAPI, reportAPI } = require('../../utils/api');
const { formatRelativeTime } = require('../../utils/helpers.js');

Page({
  data: {
    messages: [],
    filteredMessages: [],
    activeFilter: 'all',
    selectedReport: null,
    reviewNote: '',
    unreadCount: 0,
    reportCount: 0,
    pendingReportCount: 0
  },

  onLoad: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.loadMessages();
  },

  loadMessages: function() {
    wx.showLoading({ title: '加载中...' });
    messageAPI.getMessages({ pageNo: 1, pageSize: 100 }).then(res => {
      wx.hideLoading();
      if (res) {
        const messages = res.map(msg => ({
          ...msg,
          read: msg.status === 2,
          createdAt: msg.createTime,
          type: this.mapNotificationType(msg.notificationType),
          relatedId: msg.relatedId
        }));
        this.setData({ messages });
        this.updateStats();
        this.filterMessages();
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('加载消息失败:', err);
    });
  },

  mapNotificationType: function(type) {
    const typeMap = {
      '1': 'system',
      '2': 'activity',
      '3': 'item',
      '4': 'report'
    };
    return typeMap[type] || 'system';
  },

  updateStats: function() {
    const { messages } = this.data;
    const unreadCount = messages.filter(m => !m.read).length;
    const reportCount = messages.filter(m => m.type === 'report').length;
    const pendingReportCount = messages.filter(
      m => m.type === 'report' && m.report && m.report.status === '待审核'
    ).length;

    this.setData({ unreadCount, reportCount, pendingReportCount });
  },

  filterMessages: function() {
    const { messages, activeFilter } = this.data;
    let filtered = messages;

    if (activeFilter === 'unread') {
      filtered = messages.filter(m => !m.read);
    } else if (activeFilter === 'report') {
      filtered = messages.filter(m => m.type === 'report');
    }

    this.setData({ filteredMessages: filtered });
  },

  setActiveFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.filterMessages();
  },

  handleMessageClick: function(e) {
    const { id, type, relatedId } = e.currentTarget.dataset;
    
    messageAPI.readMessage(id).then(() => {
      this.markAsRead(id);
    });

    if (type === 'report' && relatedId) {
      this.loadReportDetail(relatedId);
    }
  },

  loadReportDetail: function(reportId) {
    reportAPI.getReportDetail(reportId).then(res => {
      if (res && res.success && res.data) {
        this.setData({ selectedReport: res.data });
      }
    }).catch(err => {
      console.error('加载举报详情失败:', err);
    });
  },

  markAsRead: function(id) {
    const { messages } = this.data;
    const updated = messages.map(m => 
      m.id === id ? { ...m, read: true } : m
    );
    this.setData({ messages: updated });
    this.updateStats();
    this.filterMessages();
  },

  deleteMessage: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showLoading({ title: '删除中...' });
    messageAPI.deleteMessage(id).then(res => {
      wx.hideLoading();
      console.log('删除消息响应:', res);
      if (res && res.success) {
        const { messages } = this.data;
        const filtered = messages.filter(m => m.id !== id);
        
        this.setData({ messages: filtered });
        this.updateStats();
        this.filterMessages();

        wx.showToast({ title: '消息已删除', icon: 'success', duration: 1500 });
      } else {
        wx.showToast({ title: '删除失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('删除消息失败:', err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    });
  },

  closeReportModal: function() {
    this.setData({ selectedReport: null, reviewNote: '' });
  },

  updateReviewNote: function(e) {
    this.setData({ reviewNote: e.detail.value });
  },

  handleReviewReport: function(e) {
    const statusText = e.currentTarget.dataset.status;
    const { selectedReport, reviewNote } = this.data;

    if (!selectedReport) return;

    const status = statusText === '已处理' ? 2 : 3;

    reportAPI.handleReport(selectedReport.id, status, reviewNote).then(res => {
      if (res && res.success) {
        this.setData({
          selectedReport: { ...selectedReport, status: statusText, reviewerNote: reviewNote },
          reviewNote: ''
        });
        
        const updatedMessages = this.data.messages.map(m => {
          if (m.type === 'report' && m.relatedId === selectedReport.id) {
            return { ...m, report: { ...selectedReport, status: statusText } };
          }
          return m;
        });
        this.setData({ messages: updatedMessages });
        this.updateStats();
        this.filterMessages();

        wx.showToast({ title: `举报已标记为"${statusText}"`, icon: 'success', duration: 1500 });
      }
    }).catch(err => {
      console.error('处理举报失败:', err);
      wx.showToast({ title: '处理失败', icon: 'none' });
    });
  },

  getStatusClass: function(status) {
    const statusMap = {
      '待审核': 'pending',
      '已处理': 'handled',
      '已忽略': 'invalid'
    };
    return statusMap[status] || 'pending';
  },

  formatDate: function(timestamp) {
    return formatRelativeTime(timestamp);
  },

  handleBack: function() {
    wx.navigateBack();
  }
});