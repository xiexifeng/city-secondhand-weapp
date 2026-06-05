// pages/wish-wall/wish-wall.js
const { wishWallAPI } = require('../../utils/api.js')
const { formatRelativeTime, formatDistance } = require('../../utils/format.js')
const app = getApp()

Page({
  data: {
    sortBy: 'latest',
    wishes: [],
    sortedWishes: [],
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    latitude: null,
    longitude: null
  },

  onLoad: function() {
    this.getLocationAndLoadWishes();
  },

  onShow: function() {
    // 刷新数据 先不需要，需要用户主动刷新
    // this.setData({
    //   wishes: [],
    //   sortedWishes: [],
    //   pageNo: 1,
    //   hasMore: true
    // });
    // this.loadWishes();
  },

  async getLocationAndLoadWishes() {
    try {
      const cachedLocation = app.getCachedLocation();
      if (cachedLocation.latitude !== null) {
        this.setData({ latitude: cachedLocation.latitude, longitude: cachedLocation.longitude });
      }
    } catch (e) {
      // 无缓存位置
    }
    this.loadWishes();
  },

  loadWishes: function() {
    if (this.data.loading) return Promise.resolve();
    
    this.setData({ loading: true });
    
    const params = {
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize,
      sortBy: this.data.sortBy
    };
    
    if (this.data.latitude && this.data.longitude) {
      params.latitude = this.data.latitude;
      params.longitude = this.data.longitude;
    }
    
    return wishWallAPI.getWishes(params).then(data => {
        if (data && data.length > 0) {
          const formattedWishes = data.map(wish => this.transformWishData(wish));
          const newWishes = this.data.pageNo === 1 ? formattedWishes : [...this.data.wishes, ...formattedWishes];
          this.setData({
            wishes: newWishes,
            sortedWishes: newWishes,
            pageNo: this.data.pageNo + 1,
            hasMore: data.length >= this.data.pageSize,
            loading: false
          });
        } else {
          this.setData({ 
            hasMore: false,
            loading: false
          });
        }
      }).catch(() => {
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
        this.setData({ loading: false });
      });
  },

  transformWishData: function(data) {
    const distanceResult = formatDistance(data.distance);
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      budget: data.budget,
      distance: data.distance,
      formattedDistance: distanceResult.text,
      distanceType: distanceResult.type,
      formattedTime: formatRelativeTime(data.time),
      userName: data.userName,
      verified: data.verified,
      active: data.active
    };
  },

  setSortBy: function(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ 
      sortBy: sortBy,
      pageNo: 1,
      wishes: [],
      hasMore: true
    });
    this.loadWishes();
  },

  navigateToPublish: function() {
    app.globalData.publishType = 'wish';
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },

  navigateToWishDetail: function(e) {
    const wishId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/wish-detail/wish-detail?id=${wishId}`
    });
  },

  onPullDownRefresh: function() {
    this.setData({
      wishes: [],
      sortedWishes: [],
      pageNo: 1,
      hasMore: true
    });
    this.loadWishes().then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadWishes();
    }
  }
});