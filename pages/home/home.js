const { formatRelativeTime, formatDistance } = require('../../utils/format.js');
const { itemAPI, auditAPI } = require('../../utils/api.js');
const app = getApp()

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
      { value: 'sell', label: '出售' },
      { value: 'exchange', label: '以物换物' }
    ],
    sortOptions: [
      { value: 'newest', label: '最新发布' },
      { value: 'distance', label: '距离最近' },
      { value: 'price-low', label: '价格最低' },
      { value: 'price-high', label: '价格最高' }
    ],
    latitude: null,
    longitude: null,
    locationLoaded: false,
    currentLocation: ''
  },

  async onLoad() {
    this.checkLoginStatus();
    await this.getLocation();
    await this.checkAuditStatus();
  },

  onShow() {
    this.checkLoginStatus();
    this.checkAuditStatus();
    // 刷新数据 先不需要，需要用户主动刷新
    // this.setData({
    //   items: [],
    //   page: 1,
    //   hasMore: true
    // });
    // this.loadItems();
  },

  /**
   * Check login status
   */
  checkLoginStatus: function() {
    this.setData({ isLoggedIn: app.isLoggedIn() });
  },

  /**
   * Navigate to login
   */
  navigateToLogin: function() {
    app.goToLogin();
  },

  onHide() {
    // Page hidden
  },

  // 获取用户位置（强制获取，没有缓存则弹出选择）
  async getLocation() {
    try {
      const cachedLocation = app.getCachedLocation();
      const locationDetails = app.globalData.locationDetails;
      if (cachedLocation.latitude !== null) {
        const cachedName = locationDetails?.name || '';
        const cachedAddress = locationDetails?.address || '';
        const shortName = this.getShortLocationName(cachedName, cachedAddress);
        this.setData({ 
          latitude: cachedLocation.latitude, 
          longitude: cachedLocation.longitude,
          locationLoaded: true,
          currentLocation: shortName
        })
        this.loadItems();
        return;
      }
    } catch (e) {
      // 无缓存位置
    }
    
    this.setData({ locationLoaded: false });
  },

  // 获取位置（强制弹出选择弹窗）
  async handleGetLocation() {
    try {
      const that = this;
      wx.chooseLocation({
        success: (res) => {
          const { latitude, longitude, name, address } = res;
          const shortName = that.getShortLocationName(name, address);
          const locationDetails = {
            name: name || '',
            address: address || ''
          };
          app.saveLocationToCache({ latitude, longitude, locationDetails });
          that.setData({ 
            latitude, 
            longitude,
            locationLoaded: true,
            currentLocation: shortName,
            items: [], 
            page: 1, 
            hasMore: true 
          });
          that.loadItems();
          wx.showToast({ title: '位置选择成功', icon: 'success' });
        },
        fail: (err) => {
          console.error('选择位置失败:', err.message);
          if (err.errMsg && err.errMsg.includes('cancel')) {
            wx.showToast({ title: '已取消位置选择', icon: 'none' });
          }
        }
      });
    } catch (err) {
      console.error('获取位置失败:', err.message);
    }
  },

  // 获取简短的位置名称
  getShortLocationName(name, address) {
    if (name && name.length <= 10) {
      return name;
    }
    if (name && name.length > 10) {
      return name.substring(0, 10) + '...';
    }
    if (address) {
      const parts = address.split('省');
      if (parts.length > 1) {
        let result = parts[1];
        if (result.includes('市')) {
          result = result.split('市')[1] || result;
        }
        if (result.includes('区')) {
          result = result.split('区')[1] || result;
        }
        if (result && result.length > 0) {
          return result.substring(0, 10) + '...';
        }
      }
      return address.substring(0, 10) + '...';
    }
    return '请选择位置';
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

  // 交换方式改变
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
   * Check audit status - call backend API to get auditor info
   */
  async checkAuditStatus() {
    if (!app.isLoggedIn()) {
      this.setData({ showAuditIcon: false, auditCount: 0 });
      return;
    }
    
    try {
      const auditorInfo = await auditAPI.getAuditorInfo();
      
      if (!auditorInfo) {
        this.setData({ showAuditIcon: false, auditCount: 0 });
        return;
      }
      
      const isAuditor = auditorInfo.isAuditor === true || auditorInfo.isAuditor === 'true';
      const pendingCount = parseInt(auditorInfo.pendingCount) || 0;
      
      this.setData({
        showAuditIcon: isAuditor,
        auditCount: pendingCount
      });
    } catch (error) {
      console.error('获取审核员信息失败:', error);
      this.setData({ showAuditIcon: false, auditCount: 0 });
    }
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
