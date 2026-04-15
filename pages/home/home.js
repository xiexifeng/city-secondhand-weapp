Page({
  data: {
    // 搜索和筛选
    searchKeyword: '',
    selectedTradeType: 'all',
    selectedSort: 'newest',
    showAuditIcon: false,
    
    // 物品列表
    items: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    
    // 交易方式和排序选项
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
    
    // Mock 数据 - 使用原项目的 Unsplash 图片 URL（添加图片优化参数）
    mockData: [
      {
        id: 1,
        title: 'iPhone 14 Pro Max',
        price: 5800,
        image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 1.3,
        time: '2小时前',
        tags: ['可刀', '有视频'],
        verified: true,
        urgent: true,
        location: '北京市朝阳区'
      },
      {
        id: 2,
        title: 'MacBook Pro 2019',
        price: 0,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 4.1,
        time: '5小时前',
        tags: ['可刀'],
        verified: true,
        urgent: false,
        location: '北京市海淀区'
      },
      {
        id: 3,
        title: 'Sony A6400 相机',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 0.9,
        time: '1天前',
        tags: ['有视频'],
        verified: true,
        urgent: true,
        location: '北京市东城区'
      },
      {
        id: 4,
        title: 'iPad Air 5',
        price: 0,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 3.6,
        time: '2天前',
        tags: [],
        verified: true,
        urgent: false,
        location: '北京市西城区'
      },
      {
        id: 5,
        title: 'Airpods Pro',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 1.0,
        time: '3小时前',
        tags: ['可刀'],
        verified: true,
        urgent: true,
        location: '北京市朝阳区'
      },
      {
        id: 6,
        title: 'Samsung Galaxy S24',
        price: 6500,
        image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 2.5,
        time: '4小时前',
        tags: ['有视频'],
        verified: true,
        urgent: false,
        location: '北京市东城区'
      },
      {
        id: 7,
        title: 'DJI Mavic 3',
        price: 0,
        image: 'https://images.unsplash.com/photo-1516035069371-29a08e8be310?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 5.2,
        time: '6小时前',
        tags: [],
        verified: true,
        urgent: true,
        location: '北京市朝阳区'
      },
      {
        id: 8,
        title: 'Canon EOS R5',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 3.8,
        time: '8小时前',
        tags: ['可刀'],
        verified: true,
        urgent: false,
        location: '北京市海淀区'
      },
      {
        id: 9,
        title: 'Sony WH-1000XM5',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 1.5,
        time: '10小时前',
        tags: ['有视频'],
        verified: true,
        urgent: false,
        location: '北京市西城区'
      },
      {
        id: 10,
        title: 'Apple Watch Series 8',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 0.5,
        time: '12小时前',
        tags: [],
        verified: true,
        urgent: true,
        location: '北京市东城区'
      },
      {
        id: 11,
        title: 'Nintendo Switch OLED',
        price: 0,
        image: 'https://images.unsplash.com/photo-1535803710995-c9a27ff54c3b?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 2.0,
        time: '14小时前',
        tags: ['可刀'],
        verified: true,
        urgent: false,
        location: '北京市朝阳区'
      },
      {
        id: 12,
        title: 'GoPro Hero 11',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 4.3,
        time: '16小时前',
        tags: [],
        verified: true,
        urgent: true,
        location: '北京市海淀区'
      },
      {
        id: 13,
        title: 'Fujifilm X-T5',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 3.2,
        time: '18小时前',
        tags: ['有视频'],
        verified: true,
        urgent: false,
        location: '北京市西城区'
      },
      {
        id: 14,
        title: 'Oculus Quest 3',
        price: 0,
        image: 'https://images.unsplash.com/photo-1535803710995-c9a27ff54c3b?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 1.8,
        time: '20小时前',
        tags: [],
        verified: true,
        urgent: false,
        location: '北京市东城区'
      },
      {
        id: 15,
        title: 'Bose QuietComfort 45',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 2.7,
        time: '22小时前',
        tags: ['可刀'],
        verified: true,
        urgent: true,
        location: '北京市朝阳区'
      },
      {
        id: 16,
        title: 'Kindle Paperwhite',
        price: 800,
        image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 0.8,
        time: '1天前',
        tags: [],
        verified: true,
        urgent: false,
        location: '北京市海淀区'
      },
      {
        id: 17,
        title: 'Nikon Z9',
        price: 0,
        image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 5.5,
        time: '1天前',
        tags: ['有视频'],
        verified: true,
        urgent: false,
        location: '北京市西城区'
      },
      {
        id: 18,
        title: 'Leica M11',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 3.9,
        time: '1天前',
        tags: [],
        verified: true,
        urgent: true,
        location: '北京市东城区'
      },
      {
        id: 19,
        title: 'Hasselblad H6D',
        price: 0,
        image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop&q=80',
        method: 'exchange',
        distance: 4.6,
        time: '1天前',
        tags: ['可刀'],
        verified: true,
        urgent: false,
        location: '北京市朝阳区'
      },
      {
        id: 20,
        title: 'Phase One XF IQ4',
        price: 28000,
        image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=300&h=300&fit=crop&q=80',
        method: 'sell',
        distance: 2.1,
        time: '1天前',
        tags: [],
        verified: true,
        urgent: false,
        location: '北京市海淀区'
      }
    ]
  },

  onLoad() {
    this.loadItems();
    this.checkAuditStatus();
  },

  onShow() {
    this.checkAuditStatus();
  },

  // 加载物品列表
  loadItems() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    // 模拟网络延迟
    setTimeout(() => {
      const startIndex = (this.data.page - 1) * this.data.pageSize;
      const endIndex = startIndex + this.data.pageSize;
      const newItems = this.data.mockData.slice(startIndex, endIndex);
      
      this.setData({
        items: [...this.data.items, ...newItems],
        page: this.data.page + 1,
        hasMore: endIndex < this.data.mockData.length,
        loading: false
      });
    }, 300);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      items: [],
      page: 1,
      hasMore: true
    });
    this.loadItems();
    wx.stopPullDownRefresh();
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

  // 交易方式改变
  onTradeTypeChange(e) {
    this.setData({ selectedTradeType: e.currentTarget.dataset.value });
  },

  // 排序改变
  onSortChange(e) {
    this.setData({ selectedSort: e.currentTarget.dataset.value });
  },

  // 物品点击
  onItemTap(e) {
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${itemId}`
    });
  },

  // 检查审核状态
  checkAuditStatus() {
    const auditCount = wx.getStorageSync('auditCount') || 0;
    this.setData({ showAuditIcon: auditCount > 0 });
  }
});
