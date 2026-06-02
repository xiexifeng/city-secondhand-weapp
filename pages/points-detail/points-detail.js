Page({
  data: {
    totalPoints: 0,
    monthEarnDesc: '',
    pointsHistory: [],
    totalCount: 0,
    selectedYear: '',
    selectedMonth: '',
    dateValue: '',  // 用于 picker 组件的日期值
    pageNo: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false
  },
  
  // 标题图标映射（根据title确定图标）
  titleIconMap: {
    '邀请用户注册': '👥',
    '发布物品': '📦',
    '发布心愿': '⭐',
    '物品已转让': '✅',
    '心愿已达成': '🎯',
    '审核物品': '🔍',
    '审核心愿': '🔍',
    '审核举报': '🚨',
    '浏览物品': '👀',
    '浏览心愿': '👀',
    '每日签到': '📅',
    '获得感兴趣': '❤️',
    '兑换优惠券': '🎫',
    '发布心愿': '🔄',
    '完成周任务': '🏆',
    '完成交换': '💱'
  },

  onLoad: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    
    this.initDatePicker();
    this.loadPointsData();
  },

  /**
   * 初始化日期选择器
   */
  initDatePicker: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    this.setData({
      selectedYear: year.toString(),
      selectedMonth: month.toString().padStart(2, '0'),
      dateValue: `${year}-${String(month).padStart(2, '0')}`
    });
  },

  /**
   * 加载积分数据
   */
  loadPointsData: function() {
    this.loadPointsAccount();
    this.resetAndLoadPointsHistory();
  },

  /**
   * 加载积分账户信息
   */
  loadPointsAccount: function() {
    wx.showLoading({ title: '加载中...' });
    
    const api = require('../../utils/api');
    api.userAPI.getPointsAccount()
      .then(res => {
        wx.hideLoading();
        this.setData({
          totalPoints: res.pointsBalance || 0,
          monthEarnDesc: res.monthEarnDesc || '本月获得 0 积分'
        });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '获取积分信息失败', icon: 'none' });
      });
  },

  /**
   * 重置并加载积分历史记录
   */
  resetAndLoadPointsHistory: function() {
    this.setData({
      pageNo: 1,
      pointsHistory: [],
      hasMore: true
    });
    this.loadPointsHistory(false);
  },

  /**
   * 加载积分历史记录
   */
  loadPointsHistory: function(loadMore = false) {
    if (this.data.isLoading) {
      return;
    }
    
    const { selectedYear, selectedMonth, pageNo, pageSize, pointsHistory } = this.data;
    
    this.setData({ isLoading: true });
    
    if (!loadMore) {
      wx.showLoading({ title: '加载中...' });
    }
    
    const api = require('../../utils/api');
    const requestData = {
      year: selectedYear,
      month: selectedMonth,
      pageNo: pageNo,
      pageSize: pageSize
    };
    console.log('请求参数:', requestData);
    
    api.userAPI.listPointsTransaction(requestData)
      .then(res => {
        console.log('接口返回:', res);
        if (!loadMore) {
          wx.hideLoading();
        }
        
        // 处理数据：添加图标和格式化时间
        const newList = this.processTransactionList(res || []);
        console.log('处理后的数据:', newList);
        
        // 判断是否还有更多数据
        const hasMore = newList.length === pageSize;
        
        this.setData({
          pointsHistory: loadMore ? [...pointsHistory, ...newList] : newList,
          totalCount: loadMore ? pointsHistory.length + newList.length : newList.length,
          hasMore: hasMore,
          pageNo: pageNo + 1,
          isLoading: false
        });
      })
      .catch(err => {
        console.log('接口错误:', err);
        if (!loadMore) {
          wx.hideLoading();
        }
        wx.showToast({ title: '获取积分记录失败', icon: 'none' });
        this.setData({ isLoading: false });
      });
  },

  /**
   * 加载更多
   */
  loadMore: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadPointsHistory(true);
    }
  },

  /**
     * 处理交换列表，添加图标和格式化时间
     */
    processTransactionList: function(list) {
        return list.map(item => {
            return {
                ...item,
                icon: this.titleIconMap[item.title] || '📋',
                time: this.formatDateTime(item.transactionTime)
            };
        });
    },

  /**
   * 格式化日期时间
   */
  formatDateTime: function(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    const date = new Date(dateTimeStr);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * 日期选择器变化事件
   */
  onDateChange: function(e) {
    const dateStr = e.detail.value;
    const [year, month] = dateStr.split('-');
    
    this.setData({
      selectedYear: year,
      selectedMonth: month,
      dateValue: dateStr
    });
    
    this.resetAndLoadPointsHistory();
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack();
  }
});
