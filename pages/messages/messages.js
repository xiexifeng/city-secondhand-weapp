const { messageAPI, reportAPI } = require('../../utils/api');
const { formatRelativeTime } = require('../../utils/format.js');

Page({
  data: {
    messages: [],
    filteredMessages: [],
    activeFilter: 'all',
    selectedReport: null,
    reviewNote: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    const app = getApp();
    if (!app.requireLogin()) return;
    this.loadMessages();
  },

  onShow: function() {
    const app = getApp();
    if (!app.requireLogin()) return;
    this.setData({ messages: [], filteredMessages: [], page: 1, hasMore: true });
    this.loadMessages(true);
  },

  loadMessages: function(isRefresh = false) {
    const params = {
      pageNo: isRefresh ? 1 : this.data.page,
      pageSize: this.data.pageSize
    };

    if (this.data.activeFilter === 'report') {
      params.type = 'report';
      params.status = 'all';
    }else{
      params.status = this.data.activeFilter;
    }
    
    return messageAPI.getMessages(params).then(res => {
      if (!res || !Array.isArray(res)) {
        if (isRefresh) {
          this.setData({ messages: [], filteredMessages: [] });
        }
        return;
      }
      
      const newMessages = res.map(msg => ({
        ...msg,
        read: msg.status === 2,
        createdAt: this.formatDate(msg.createTime),
        type: msg.notificationType ? (String(msg.notificationType).toUpperCase() === 'REPORT' ? 'report' : 
              String(msg.notificationType).toUpperCase() === 'AUDIT' ? 'alert' :
              String(msg.notificationType).toUpperCase() === 'TRADE' ? 'activity' :
              String(msg.notificationType).toUpperCase() === 'STUFF' ? 'item' : 'system') : 'system',
        relatedId: msg.relatedId,
        originalType: msg.notificationType
      }));
      
      const messages = isRefresh ? newMessages : [...this.data.messages, ...newMessages];
      
      this.setData({
        messages,
        page: isRefresh ? 2 : this.data.page + 1,
        hasMore: newMessages.length >= this.data.pageSize,
        filteredMessages: messages
      });
    }).catch(err => {
      console.error('加载消息失败:', err);
      throw err;
    });
  },

  

  setActiveFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ 
      activeFilter: filter,
      messages: [],
      page: 1,
      hasMore: true
    });
    this.loadMessages(true);
  },

  onPullDownRefresh: function() {
    this.loadMessages(true).then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMessages();
    }
  },

  handleMessageClick: function(e) {
    const { id, relatedId, originalType, type } = e.currentTarget.dataset;

    console.log('handleMessageClick:', { id, relatedId, originalType, type });

    messageAPI.readMessage(id).then(() => {
      this.markAsRead(id);
    }).catch(err => {
      console.error('标记已读失败:', err);
    });

    if (originalType && String(originalType).toUpperCase() === 'REPORT' && relatedId) {
      console.log('加载举报详情:', relatedId);
      this.loadReportDetail(relatedId);
    } else if (type === 'report' && relatedId) {
      console.log('通过type检测加载举报详情:', relatedId);
      this.loadReportDetail(relatedId);
    }
  },

  loadReportDetail: function(reportId) {
    wx.showLoading({ title: '加载中...' });
    reportAPI.getReportDetail(reportId).then(res => {
      wx.hideLoading();
      console.log('举报详情返回:', res);
      if (res) {
        const report = res;
        report.statusText = this.getStatusText(report.status);
        report.statusClass = this.getStatusClass(report.status);
        report.typeText = this.getReportTypeText(report.type);
        this.setData({ selectedReport: report });
        console.log('已设置selectedReport:', this.data.selectedReport);
      } else {
        wx.showToast({ title: '获取详情失败', icon: 'none' });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('加载举报详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  markAsRead: function(id) {
    if (!id) return;
    
    const { messages, filteredMessages } = this.data;
    const targetId = String(id);
    
    const updatedMessages = messages.map(m =>
      String(m.id) === targetId ? { ...m, read: true } : m
    );
    
    const updatedFiltered = filteredMessages.map(m =>
      String(m.id) === targetId ? { ...m, read: true } : m
    );
    
    this.setData({ messages: updatedMessages, filteredMessages: updatedFiltered });
  },

  deleteMessage: function(e) {
    const id = e.currentTarget.dataset.id;

    wx.showLoading({ title: '删除中...' });
    messageAPI.deleteMessage(id).then(res => {
      wx.hideLoading();
      if (res && res.success) {
        const { messages } = this.data;
        const filtered = messages.filter(m => m.id !== id);

        this.setData({ messages: filtered, filteredMessages: filtered });

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

    const status = statusText === '举报有效' ? 2 : 3;

    wx.showLoading({ title: '处理中...' });
    reportAPI.handleReport(selectedReport.id, status, reviewNote).then(res => {
      wx.hideLoading();
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
        this.setData({ messages: updatedMessages, filteredMessages: updatedMessages });

        wx.showToast({ title: '处理成功', icon: 'success', duration: 1500 });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('处理举报失败:', err);
      wx.showToast({ title: '处理失败', icon: 'none' });
    });
  },

  getStatusClass: function(status) {
    const statusMap = {
      'pending': 'pending',
      'valid': 'handled',
      'ignored': 'invalid'
    };
    return statusMap[status] || 'pending';
  },

  getStatusText: function(status) {
    const statusMap = {
      'pending': '待审核',
      'valid': '举报有效',
      'ignored': '举报无效'
    };
    return statusMap[status] || status;
  },

  getReportTypeText: function(type) {
    const typeMap = {
      'item': '物品举报',
      'wish': '心愿举报',
      'user': '用户投诉'
    };
    return typeMap[type] || '举报详情';
  },

  formatDate: function(timestamp) {
    return formatRelativeTime(timestamp);
  },

  handleBack: function() {
    wx.navigateBack();
  }
});