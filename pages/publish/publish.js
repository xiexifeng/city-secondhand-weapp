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
    contactSettingsExpanded: false
  },

  onLoad: function() {
    // 页面加载
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
    this.setData({ agreed: !this.data.agreed });
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
    const { agreed, formData, publishType, images } = this.data;

    // 检查是否同意免责声明
    if (!agreed) {
      wx.showToast({
        title: '请同意免责声明',
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

    // 发布成功
    wx.showToast({
      title: '发布成功！',
      icon: 'success',
      duration: 1500
    });

    // 延迟后跳转到个人资料页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/profile/profile'
      });
    }, 1500);
  }
});
