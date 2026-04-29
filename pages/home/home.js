const { formatRelativeTime, formatDistance } = require('../../utils/format.js');
const { itemAPI } = require('../../utils/api.js');

Page({
  data: {
    isLoggedIn: false,
    searchKeyword: '',
    selectedTradeType: 'all',
    selectedSort: 'newest',
    showAuditIcon: false,
    auditCount: 0,
    items: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    tradeTypes: [
      { value: 'all', label: '全部方式' },
      { value: 'sell', label: '人民币出售' },
      { value: 'exchange', label: '以物换物' }
    ],
    sortOptions: [
      { value: 'newest', label: '最新发布' },
      { value: 'distance', label: '距离最近' },
      { value: 'price-low', label: '价格最低' },
      { value: 'price-high', label: '价格最高' }
    ],
    latitude: null,
    longitude: null
  },

  onLoad() {
    this.checkLoginStatus();
    this.getLocation(() => {
      this.loadItems();
    });
    this.checkAuditStatus();
  },

  onShow() {
    this.checkLoginStatus();
    this.checkAuditStatus();
  },

  /**
   * Check login status
   */
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    this.setData({ isLoggedIn: !!token });
  },

  /**
   * Navigate to login
   */
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onHide() {
    // Page hidden
  },

  // 获取用户位置
  getLocation(callback) {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
        callback && callback();
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        callback && callback();
      }
    });
  },

  // 加载物品列表
  async loadItems() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const params = {
        pageNo: this.data.page,
        pageSize: this.data.pageSize,
        searchKey: this.data.searchKeyword || null,
        tradeType: this.data.selectedTradeType === 'all' ? null : this.data.selectedTradeType,
        sortBy: this.data.selectedSort,
        latitude: this.data.latitude,
        longitude: this.data.longitude
      };
      
      // 过滤掉null值
      Object.keys(params).forEach(key => params[key] === null && delete params[key]);
      
      const response = await itemAPI.getItems(params);
      
      // 后端直接返回数组
      const newItems = Array.isArray(response) ? response : (response.data || []);
      
      const formattedItems = newItems.map(item => ({
        ...item,
        formattedTime: item.time ? formatRelativeTime(item.time) : '',
        formattedDistance: formatDistance(item.distance).text,
        distanceType: formatDistance(item.distance).type
      }));
      
      this.setData({
        items: this.data.page === 1 ? formattedItems : [...this.data.items, ...formattedItems],
        page: this.data.page + 1,
        hasMore: newItems.length >= this.data.pageSize,
        loading: false
      });
    } catch (error) {
      console.error('加载物品列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      items: [],
      page: 1,
      hasMore: true
    });
    this.loadItems().then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadItems();
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 点击搜索按钮
  onSearch() {
    this.setData({
      items: [],
      page: 1,
      hasMore: true
    });
    this.loadItems();
  },

  // 交易方式改变
  onTradeTypeChange(e) {
    this.setData({
      selectedTradeType: e.currentTarget.dataset.value,
      items: [],
      page: 1,
      hasMore: true
    });
    this.loadItems();
  },

  // 排序改变
  onSortChange(e) {
    this.setData({
      selectedSort: e.currentTarget.dataset.value,
      items: [],
      page: 1,
      hasMore: true
    });
    this.loadItems();
  },

  // 物品点击
  onItemTap(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${itemId}`
    });
  },

  /**
   * Check audit status
   */
  checkAuditStatus() {
    const auditCount = wx.getStorageSync('auditCount') || 5;
    this.setData({ 
      showAuditIcon: auditCount > 0,
      auditCount: auditCount
    });
  },

  // 导航到审核页面
  navigateToModeration() {
    wx.navigateTo({
      url: '/pages/content-moderation/content-moderation'
    });
  },

  // 图片加载失败处理
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const items = [...this.data.items];
    // 设置默认图片
    items[index].image = '/assets/images/error-image.svg';
    this.setData({ items });
  }
});
