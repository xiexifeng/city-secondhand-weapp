const { itemAPI, wishAPI, fileAPI } = require('../../utils/api');
const { CATEGORIES, CONDITIONS, TAGS, MAX_LENGTHS, CONDITION_MAP } = require('../../config.js');

function getDefaultData() {
  const userInfo = wx.getStorageSync('userInfo');
  const userPhone = userInfo.phone || wx.getStorageSync('userPhone');
  const wechat = userInfo.wechat || '';
  
  return {
    publishType: null,
    images: [],
    formData: {
      title: '',
      description: '',
      price: '',
      category: '数码3C',
      wechat: wechat,
      phone: userPhone || '',
      location: '北京市朝阳区',
      latitude: null,
      longitude: null,
      wantItem: '',
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
    contactSettingsExpanded: false,
    readCountdown: 0,
    canPublish: false,
    isSubmitting: false,
    scrollToView: '',
    editingId: null
  };
}

const DEFAULT_DATA = getDefaultData();

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
      latitude: null,
      longitude: null,
      wantItem: '',
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
    tags: TAGS,
    categories: CATEGORIES,
    conditions: CONDITIONS,
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
      // 立即清空编辑ID，避免onShow再次触发
      const editItemId = app.globalData.editItemId;
      app.globalData.editItemId = null;
      // 先设置publishType，确保页面立即显示表单
      this.setData({ publishType: 'sell' }, () => {
        // 然后加载编辑数据
        this.loadEditData(editItemId);
      });
    } else if (app.globalData.editWishId) {
      console.log('Entering edit mode for wish id:', app.globalData.editWishId);
      // 立即清空编辑ID，避免onShow再次触发
      const editWishId = app.globalData.editWishId;
      app.globalData.editWishId = null;
      // 先设置publishType为求换墙，确保页面立即显示表单
      this.setData({ publishType: 'wish' }, () => {
        // 然后加载编辑数据
        this.loadEditWishData(editWishId);
      });
    }else{
      this.setData(DEFAULT_DATA);
    }
  },

  /**
   * 加载编辑数据
   */
  loadEditData: async function(id) {
    console.log('Loading edit data for item id:', id);
    
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const result = await itemAPI.getMyItemDetail(id);
      
      if (result && result.success && result.data) {
        const item = result.data;
        console.log('Loaded item data:', item);
        
        const categoryIndex = this.data.categories.indexOf(item.category);
        const conditionIndex = this.getConditionIndex(item.depreciation);
        
        let locationDetails = {};
        let locationStr = item.location || '北京市朝阳区';
        
        try {
          const parsedLocation = JSON.parse(item.location);
          locationDetails = {
            province: parsedLocation.province || '北京市',
            city: parsedLocation.city || '北京市',
            district: parsedLocation.district || '朝阳区'
          };
          locationStr = parsedLocation.location || `${locationDetails.province}${locationDetails.city}${locationDetails.district}`;
        } catch (e) {
          locationDetails = {
            province: '北京市',
            city: '北京市',
            district: '朝阳区'
          };
        }
        
        const images = item.itemImageList || (item.firstImage ? [item.firstImage] : []);
        
        const savedTags = item.tags ? item.tags.split(',').filter(tag => tag.trim()) : [];
        const updatedTags = this.data.tags.map(tag => ({
          ...tag,
          selected: savedTags.includes(tag.name)
        }));
        
        this.setData({
          publishType: item.tradeType,
          images: images,
          tags: updatedTags,
          formData: {
            title: item.itemTitle || '',
            description: item.itemDescription || '',
            price: item.price ? item.price.toString() : '',
            category: item.category || '数码3C',
            wechat: item.wechat || '',
            phone: item.phone || '',
            location: locationStr,
            latitude: item.latitude,
            longitude: item.longitude,
            wantItem: item.wantItem || '',
            budget: '',
            condition: this.getConditionLabel(item.depreciation),
            contactVisibility: item.contactVisibility || 'both'
          },
          locationDetails: locationDetails,
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
          conditionIndex: conditionIndex >= 0 ? conditionIndex : 2,
          editingId: id
        }, function() {
          console.log('Edit data set successfully');
        });
      } else {
        wx.showToast({
          title: '获取物品信息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('Failed to load edit data:', error);
      wx.showToast({
        title: '获取物品信息失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 根据折旧值获取成色索引
   */
  getConditionIndex: function(depreciation) {
    const conditions = this.data.conditions;
    const conditionMap = {
      1: '全新',
      2: '95成新',
      3: '9成新',
      4: '8成新',
      5: '7成新',
      6: '6成新',
      7: '5成新及以下'
    };
    const conditionLabel = conditionMap[depreciation] || '9成新';
    return conditions.indexOf(conditionLabel);
  },

  /**
   * 根据折旧值获取成色标签
   */
  getConditionLabel: function(depreciation) {
    const conditionMap = {
      1: '全新',
      2: '95成新',
      3: '9成新',
      4: '8成新',
      5: '7成新',
      6: '6成新',
      7: '5成新及以下'
    };
    return conditionMap[depreciation] || '9成新';
  },

  /**
   * 加载编辑心愿数据
   */
  loadEditWishData: async function(id) {
    console.log('Loading edit data for wish id:', id);
    
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const result = await wishAPI.getMyWishDetail(id);
      
      if (result && result.success && result.data) {
        const wish = result.data;
        console.log('Loaded wish data:', wish);
        
        const categoryIndex = this.data.categories.indexOf(wish.category);
        
        let locationDetails = {};
        let locationStr = wish.location || '北京市朝阳区';
        
        try {
          const parsedLocation = JSON.parse(wish.location);
          locationDetails = {
            province: parsedLocation.province || '北京市',
            city: parsedLocation.city || '北京市',
            district: parsedLocation.district || '朝阳区'
          };
          locationStr = parsedLocation.location || `${locationDetails.province}${locationDetails.city}${locationDetails.district}`;
        } catch (e) {
          locationDetails = {
            province: '北京市',
            city: '北京市',
            district: '朝阳区'
          };
        }
        
        const images = wish.wishImageList || (wish.firstImage ? [wish.firstImage] : []);
        
        const savedTags = wish.tags ? wish.tags.split(',').filter(tag => tag.trim()) : [];
        const updatedTags = this.data.tags.map(tag => ({
          ...tag,
          selected: savedTags.includes(tag.name)
        }));
        
        this.setData({
          publishType: 'wish',
          images: images,
          tags: updatedTags,
          formData: {
            title: wish.wishTitle || '',
            description: wish.wishDescription || '',
            price: '',
            category: wish.category || '数码3C',
            wechat: wish.wechat || '',
            phone: wish.phone || '',
            location: locationStr,
            latitude: wish.latitude,
            longitude: wish.longitude,
            wantItem: '',
            budget: wish.budget || '',
            condition: '9成新',
            contactVisibility: wish.contactVisibility || 'both'
          },
          locationDetails: locationDetails,
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
          conditionIndex: 2,
          editingId: id
        }, function() {
          console.log('Wish edit data set successfully');
        });
      } else {
        wx.showToast({
          title: '获取心愿信息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('Failed to load edit wish data:', error);
      wx.showToast({
        title: '获取心愿信息失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
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
      sizeType: ['compressed'], // 只选择压缩后的图片
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 立即上传选中的图片
        this.uploadImages(res.tempFilePaths);
      }
    });
  },

  /**
   * 上传图片到服务器
   */
  uploadImages: async function(tempFilePaths) {
    const { images } = this.data;
    const uploadedImages = [...images];

    for (const tempFilePath of tempFilePaths) {
      try {
        // 显示上传中提示
        wx.showLoading({
          title: '上传中...',
          mask: true
        });

        // 上传图片
        const uploadResult = await fileAPI.uploadImage(tempFilePath);
        uploadedImages.push(uploadResult.data.fileUrl);

        // 更新图片列表
        this.setData({
          images: uploadedImages
        });
      } catch (error) {
        console.error('图片上传失败:', error);
        // 上传失败，提示用户
        wx.showToast({
          title: '图片上传失败，请重试',
          icon: 'none'
        });
        // 移除失败的图片（这里只是不添加到列表）
      } finally {
        // 隐藏加载提示
        wx.hideLoading();
      }
    }
  },

  /**
   * 处理图片变更事件
   */
  handleImageChange: function(e) {
    const { images } = e.detail;
    this.setData({ images });
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
    const maxLengths = MAX_LENGTHS;
    
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
   * 发布物品或心愿
   */
  handlePublish: async function() {
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
      if (!formData.wechat) {
        wx.showToast({
          title: '请填写微信',
          icon: 'none'
        });
        return;
      }
    } else if (formData.contactVisibility === 'phone') {
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

    if (publishType === 'exchange' && !formData.wantItem) {
      wx.showToast({
        title: '请填写需求',
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

    this.setData({ isSubmitting: true });

    try {
      const { locationDetails } = this.data;
      const locationData = {
        province: locationDetails.province || '',
        city: locationDetails.city || '',
        district: locationDetails.district || '',
        location: formData.location
      };

      let result;
      
      if (publishType === 'wish') {
        const wishData = {
          wishTitle: formData.title,
          wishDescription: formData.description,
          wishImageList: images,
          category: formData.category,
          budget: formData.budget,
          location: JSON.stringify(locationData),
          latitude: formData.latitude || 39.9042,
          longitude: formData.longitude || 116.4074,
          wechat: formData.contactVisibility === 'phone' ? null : formData.wechat,
          phone: formData.contactVisibility === 'wechat' ? null : formData.phone,
          contactVisibility: formData.contactVisibility,
          tags: this.getSelectedTags()
        };

        if (editingId) {
          result = await wishAPI.updateWish(editingId, wishData);
        } else {
          result = await wishAPI.publishWish(wishData);
        }
      } else {
        const itemData = {
          itemTitle: formData.title,
          itemDescription: formData.description,
          itemImageList: images,
          depreciation: this.getDepreciationValue(formData.condition),
          price: formData.price,
          category: formData.category,
          tradeType: publishType,
          wantItem: formData.wantItem,
          location: JSON.stringify(locationData),
          latitude: formData.latitude || 39.9042,
          longitude: formData.longitude || 116.4074,
          wechat: formData.contactVisibility === 'phone' ? null : formData.wechat,
          phone: formData.contactVisibility === 'wechat' ? null : formData.phone,
          contactVisibility: formData.contactVisibility,
          tags: this.getSelectedTags()
        };

        if (editingId) {
          result = await itemAPI.updateItem(editingId, itemData);
        } else {
          result = await itemAPI.publishItem(itemData);
        }
      }
      
      if (result && result.success) {
        this.setData({ isSubmitting: false });
        
        wx.showToast({
          title: editingId ? '编辑成功！' : '发布成功！',
          icon: 'success',
          duration: 1500
        });
        
        setTimeout(() => {
          this.setData({
            ...DEFAULT_DATA,
            tags: TAGS.map(tag => ({ ...tag, selected: false })),
            categories: CATEGORIES,
            conditions: CONDITIONS
          });
          
          wx.switchTab({
            url: '/pages/profile/profile'
          });
        }, 1500);
      } else {
        throw new Error(result && result.desc || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      });
      this.setData({ isSubmitting: false });
    }
  },

  /**
   * 根据物品成色获取折旧值
   */
  getDepreciationValue: function(condition) {
    return CONDITION_MAP[condition] || 5;
  },

  /**
   * 获取选中的标签，返回逗号分隔的字符串
   */
  getSelectedTags: function() {
    const { tags } = this.data;
    const selectedTags = tags.filter(tag => tag.selected).map(tag => tag.name);
    return selectedTags.join(',');
  }
});
