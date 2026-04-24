Page({
  data: {
    publishType: null,  // 'sell' | 'exchange' | 'wish'
    images: [],
    formData: {
      title: '',
      description: '',
      price: '',
      category: '数码3C',
      wechat: '',
      phone: '',
      location: '北京市朝阳区',
      wantItems: '',
      budget: '',
      condition: '9成新',
      contactVisibility: 'both'
    },
    locationDetails: {
      province: '北京市',
      city: '北京市',
      district: '朝阳区'
    },
    agreed: false,
    categoryIndex: 0,
    conditionIndex: 2,
    tags: [
      { name: '全新未拆封', selected: false },
      { name: '国行版本', selected: false },
      { name: '原装配件', selected: false },
      { name: '保修期内', selected: false },
      { name: '无划痕', selected: false },
      { name: '当面交易', selected: false },
      { name: '可小刀', selected: false },
      { name: '包邮', selected: false }
    ],
    categories: [
      '数码3C',
      '服饰鞋包',
      '家居生活',
      '母婴用品',
      '书籍文具',
      '美妆个护',
      '运动户外',
      '其他'
    ],
    conditions: [
      '全新',
      '9.5成新',
      '9成新',
      '8.5成新',
      '8成新',
      '7成新',
      '6成新',
      '5成新',
      '以下'
    ],
    // 折叠状态
    contactSettingsExpanded: false,
    // 免责声明阅读倒计时
    readCountdown: 0,
    canPublish: false,
    // 防重复提交
    isSubmitting: false,
    // 滚动到指定位置
    scrollToView: ''
  },

  onLoad: function(options) {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    // 页面加载
    this.checkEditMode();
  },

  onShow: function() {
    // 页面显示时检查是否需要进入编辑模式
    this.checkEditMode();
  },

  /**
   * 检查是否需要进入编辑模式
   */
  checkEditMode: function() {
    const app = getApp();
    if (app.globalData.editItemId) {
      console.log('Entering edit mode for item id:', app.globalData.editItemId);
      // 先设置publishType，确保页面立即显示表单
      this.setData({ publishType: 'sell' }, () => {
        // 然后加载编辑数据
        this.loadEditData(app.globalData.editItemId);
        // 清空编辑ID，避免下次进入时自动编辑
        app.globalData.editItemId = null;
      });
    } else if (app.globalData.editWishId) {
      console.log('Entering edit mode for wish id:', app.globalData.editWishId);
      // 先设置publishType为求换墙，确保页面立即显示表单
      this.setData({ publishType: 'wish' }, () => {
        // 然后加载编辑数据
        this.loadEditWishData(app.globalData.editWishId);
        // 清空编辑ID，避免下次进入时自动编辑
        app.globalData.editWishId = null;
      });
    }
  },

  /**
   * 加载编辑数据
   */
  loadEditData: function(id) {
    console.log('Loading edit data for item id:', id);
    // 模拟从已发布物品页面获取数据
    const publishedItems = [
      {
        id: 1,
        title: 'iPhone 14 Pro Max',
        price: 5800,
        image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '9成新，无划痕，原装配件齐全',
        status: '在售',
        views: 245,
        likes: 18,
        publishDate: '2024-03-20',
        transactionType: '人民币',
        reviewStatus: '已通过',
        location: '北京市朝阳区'
      },
      {
        id: 2,
        title: 'MacBook Pro 2019',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '13寸，i5处理器，8GB内存，256GB SSD',
        status: '已成交',
        views: 312,
        likes: 42,
        publishDate: '2024-03-15',
        transactionType: '人民币',
        reviewStatus: '已通过',
        location: '北京市朝阳区'
      },
      {
        id: 3,
        title: 'Sony A6400 相机',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '微单相机，配16-50mm镜头，完美状态',
        status: '成交中',
        views: 156,
        likes: 12,
        publishDate: '2024-03-18',
        transactionType: '都可以',
        reviewStatus: '待审核',
        location: '北京市朝阳区'
      },
      {
        id: 4,
        title: 'Nike 跑鞋',
        price: 599,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        category: '服装鞋帽',
        description: '全新未穿，官方正品，尺码42',
        status: '已下架',
        views: 89,
        likes: 5,
        publishDate: '2024-03-19',
        transactionType: '人民币',
        reviewStatus: '审核不通过',
        rejectionReason: '图片质量低',
        location: '北京市朝阳区'
      }
    ];
    
    const item = publishedItems.find(item => item.id == id);
    console.log('Found item:', item);
    if (item) {
      const categoryIndex = this.data.categories.indexOf(item.category);
      const conditionIndex = this.data.conditions.indexOf(item.condition || '9成新');
      console.log('Category index:', categoryIndex, 'Condition index:', conditionIndex);
      
      this.setData({
        publishType: 'sell',
        images: [item.image],
        formData: {
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          wechat: '',
          phone: '',
          location: item.location,
          wantItems: '',
          budget: '',
          condition: item.condition || '9成新',
          contactVisibility: 'both'
        },
        locationDetails: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区'
        },
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        conditionIndex: conditionIndex >= 0 ? conditionIndex : 2,
        editingId: id
      }, function() {
        console.log('Data set successfully');
      });
    } else {
      console.log('Item not found for id:', id);
    }
  },

  /**
   * 加载编辑心愿数据
   */
  loadEditWishData: function(id) {
    console.log('Loading edit data for wish id:', id);
    // 模拟从求换页面获取数据
    const wishes = [
      {
        id: 1,
        title: '求 iPad Pro M4 11寸',
        description: '想要一台iPad Pro用于设计工作，可用MacBook Pro 2019加差价交换',
        category: '数码3C',
        expectedMethod: '以物换物',
        priceRange: '差价 5000-8000',
        status: '活跃',
        createdAt: '2024-03-20',
        views: 45,
        interests: 3,
        reviewStatus: '已通过'
      },
      {
        id: 2,
        title: '求 Sony A6400 相机',
        description: '需要一台微单相机，预算3000-4000元',
        category: '数码3C',
        expectedMethod: '人民币',
        priceRange: '3000-4000',
        status: '活跃',
        createdAt: '2024-03-18',
        views: 28,
        interests: 2,
        reviewStatus: '待审核'
      },
      {
        id: 3,
        title: '求 Dyson 吹风机',
        description: '想要一台Dyson吹风机，可用旧吹风机加现金交换',
        category: '美妆个护',
        expectedMethod: '都可以',
        status: '已下架',
        createdAt: '2024-03-15',
        views: 12,
        interests: 0,
        reviewStatus: '审核不通过',
        rejectionReason: '描述信息不清楚'
      },
      {
        id: 4,
        title: '求 Nintendo Switch OLED',
        description: '想要一台Nintendo Switch OLED，可用PS4加差价交换',
        category: '数码3C',
        expectedMethod: '以物换物',
        priceRange: '差价 1000-1500',
        status: '活跃',
        createdAt: '2024-03-10',
        views: 35,
        interests: 1,
        reviewStatus: '审核不通过',
        rejectionReason: '缺少详细描述'
      }
    ];
    
    const wish = wishes.find(wish => wish.id == id);
    console.log('Found wish:', wish);
    if (wish) {
      const categoryIndex = this.data.categories.indexOf(wish.category);
      console.log('Category index:', categoryIndex);
      
      this.setData({
        publishType: 'wish',
        formData: {
          title: wish.title,
          description: wish.description,
          price: '',
          category: wish.category,
          wechat: '',
          phone: '',
          location: '北京市朝阳区',
          wantItems: wish.description,
          budget: wish.priceRange || '',
          condition: '9成新',
          contactVisibility: 'both'
        },
        locationDetails: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区'
        },
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        conditionIndex: 2,
        editingId: id
      }, function() {
        console.log('Wish data set successfully');
      });
    } else {
      console.log('Wish not found for id:', id);
    }
  },

  /**
   * 选择发布方式
   */
  selectPublishType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ publishType: type });
  },

  /**
   * 返回发布方式选择
   */
  backToTypeSelect: function() {
    this.setData({ publishType: null });
  },

  /**
   * 返回首页
   */
  handleBack: function() {
    wx.navigateBack();
  },

  /**
   * 上传图片
   */
  handleUploadImage: function() {
    const { images } = this.data;
    if (images.length >= 9) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      });
      return;
    }

    wx.chooseImage({
      count: 9 - images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: [...images, ...res.tempFilePaths]
        });
      }
    });
  },

  /**
   * 删除图片
   */
  removeImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const { images } = this.data;
    images.splice(index, 1);
    this.setData({ images });
  },

  /**
   * 更新表单数据
   */
  updateFormData: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const { formData } = this.data;
    
    // 检查字数限制
    const maxLengths = {
      title: 30,
      description: 500,
      price: 10,
      wantItems: 50,
      budget: 100,
      wechat: 20,
      phone: 11
    };
    
    if (maxLengths[field] && value.length > maxLengths[field]) {
      wx.showToast({
        title: `最多输入${maxLengths[field]}个字符`,
        icon: 'none'
      });
      return;
    }
    
    // 验证手机号格式
    if (field === 'phone') {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (value && !phoneRegex.test(value)) {
        wx.showToast({
          title: '请输入合法的手机号',
          icon: 'none'
        });
        return;
      }
    }
    
    formData[field] = value;
    this.setData({ formData });
  },

  /**
   * 分类选择
   */
  onCategoryChange: function(e) {
    const { categories, formData } = this.data;
    const index = e.detail.value;
    formData.category = categories[index];
    this.setData({
      categoryIndex: index,
      formData
    });
  },

  /**
   * 物品成色选择
   */
  onConditionChange: function(e) {
    const { conditions, formData } = this.data;
    const index = e.detail.value;
    formData.condition = conditions[index];
    this.setData({
      conditionIndex: index,
      formData
    });
  },

  /**
   * 打开位置选择器
   */
  openLocationPicker: function() {
    wx.navigateTo({
      url: '/pages/location/location'
    });
  },

  /**
   * 更新联系方式可见性
   */
  updateContactVisibility: function(e) {
    const value = e.currentTarget.dataset.value;
    const { formData } = this.data;
    formData.contactVisibility = value;
    this.setData({ formData });
  },

  /**
   * 切换标签选择
   */
  toggleTag: function(e) {
    const tagName = e.currentTarget.dataset.tag;
    const { tags } = this.data;
    const newTags = [...tags];
    const tagIndex = newTags.findIndex(tag => tag.name === tagName);
    
    if (tagIndex !== -1) {
      // 计算当前选中的标签数量
      const selectedCount = newTags.filter(tag => tag.selected).length;
      
      if (newTags[tagIndex].selected) {
        // 取消选择
        newTags[tagIndex].selected = false;
      } else {
        // 选择标签，最多3个
        if (selectedCount < 3) {
          newTags[tagIndex].selected = true;
        } else {
          wx.showToast({
            title: '最多选择3个标签',
            icon: 'none'
          });
          return;
        }
      }
      
      this.setData({ tags: newTags });
    }
  },

  /**
   * 切换同意免责声明
   */
  toggleAgreed: function() {
    const newAgreed = !this.data.agreed;
    
    if (newAgreed) {
      // 跳到免责声明部分
      this.setData({ scrollToView: 'disclaimer-section' });
      
      // 开始5秒倒计时
      this.setData({ readCountdown: 5 });
      
      // 倒计时逻辑
      const timer = setInterval(() => {
        this.setData({
          readCountdown: this.data.readCountdown - 1
        });
        
        if (this.data.readCountdown <= 0) {
          clearInterval(timer);
          this.setData({ canPublish: true });
        }
      }, 1000);
    } else {
      // 取消勾选时重置状态
      this.setData({ 
        canPublish: false,
        readCountdown: 0,
        scrollToView: ''
      });
    }
    
    this.setData({ agreed: newAgreed });
  },

  /**
   * 切换联系方式设置展开状态
   */
  toggleContactSettings: function() {
    this.setData({
      contactSettingsExpanded: !this.data.contactSettingsExpanded
    });
  },

  /**
   * 发布物品
   */
  handlePublish: function() {
    const { agreed, formData, publishType, images, canPublish, editingId, isSubmitting } = this.data;

    // 防重复提交
    if (isSubmitting) {
      return;
    }

    // 检查是否同意免责声明
    if (!agreed) {
      wx.showToast({
        title: '请同意免责声明',
        icon: 'none'
      });
      return;
    }

    // 检查是否完成强制阅读
    if (!canPublish) {
      wx.showToast({
        title: '请完成免责声明阅读',
        icon: 'none'
      });
      return;
    }

    // 检查必填项
    if (!formData.title) {
      wx.showToast({
        title: '请填写标题',
        icon: 'none'
      });
      return;
    }

    // 检查联系方式
    if (formData.contactVisibility === 'both') {
      // 显示微信和电话，两个都需要填写
      if (!formData.wechat) {
        wx.showToast({
          title: '请填写微信',
          icon: 'none'
        });
        return;
      }
      if (!formData.phone) {
        wx.showToast({
          title: '请填写电话',
          icon: 'none'
        });
        return;
      }
    } else if (formData.contactVisibility === 'wechat') {
      // 仅显示微信，只需要填写微信
      if (!formData.wechat) {
        wx.showToast({
          title: '请填写微信',
          icon: 'none'
        });
        return;
      }
    } else if (formData.contactVisibility === 'phone') {
      // 仅显示电话，只需要填写电话
      if (!formData.phone) {
        wx.showToast({
          title: '请填写电话',
          icon: 'none'
        });
        return;
      }
    }

    // 检查发布类型特定的必填项
    if (publishType === 'sell' && !formData.price) {
      wx.showToast({
        title: '请填写价格',
        icon: 'none'
      });
      return;
    }

    if (publishType !== 'wish' && images.length === 0) {
      wx.showToast({
        title: '请上传至少一张图片',
        icon: 'none'
      });
      return;
    }

    // 设置提交中状态
    this.setData({ isSubmitting: true });

    try {
      // 发布成功
      wx.showToast({
        title: editingId ? '编辑成功！' : '发布成功！',
        icon: 'success',
        duration: 1500
      });

      // 延迟后跳转到已发布物品页面
      setTimeout(() => {
        if (editingId) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/profile/profile'
          });
        }
        // 恢复提交状态
        this.setData({ isSubmitting: false });
      }, 1500);
    } catch (error) {
      // 处理错误
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      });
      // 恢复提交状态
      this.setData({ isSubmitting: false });
    }
  }
});
