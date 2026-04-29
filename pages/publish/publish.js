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
    tags: TAGS.map(tag => ({ ...tag, selected: false })),
    categories: CATEGORIES,
    conditions: CONDITIONS,
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
  data: DEFAULT_DATA,

  onLoad: function(options) {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.checkEditMode();
  },

  onShow: function() {
    this.checkEditMode();
  },

  checkEditMode: function() {
    const app = getApp();
    if (app.globalData.editItemId) {
      const editItemId = app.globalData.editItemId;
      app.globalData.editItemId = null;
      this.setData({ publishType: 'sell' }, () => {
        this.loadEditData(editItemId, 'item');
      });
    } else if (app.globalData.editWishId) {
      const editWishId = app.globalData.editWishId;
      app.globalData.editWishId = null;
      this.setData({ publishType: 'wish' }, () => {
        this.loadEditData(editWishId, 'wish');
      });
    }
  },

  loadEditData: async function(id, type) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      const api = type === 'wish' ? wishAPI : itemAPI;
      const method = type === 'wish' ? 'getMyWishDetail' : 'getMyItemDetail';
      const result = await api[method](id);
      
      if (result && result.success && result.data) {
        const data = result.data;
        this.setEditData(data, type, id);
      } else {
        wx.showToast({ title: '获取信息失败', icon: 'none' });
      }
    } catch (error) {
      console.error(`Failed to load edit ${type} data:`, error);
      wx.showToast({ title: '获取信息失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  setEditData: function(data, type, id) {
    const categoryIndex = this.data.categories.indexOf(data.category);
    const conditionIndex = type === 'wish' ? 2 : this.getConditionIndex(data.depreciation);
    
    const { locationStr, locationDetails } = this.parseLocation(data.location);
    const images = this.getImages(data, type);
    const updatedTags = this.getUpdatedTags(data.tags);

    const formData = this.buildFormData(data, type, locationStr);
    
    this.setData({
      publishType: type === 'wish' ? 'wish' : data.tradeType,
      images: images,
      tags: updatedTags,
      formData: formData,
      locationDetails: locationDetails,
      categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      conditionIndex: conditionIndex >= 0 ? conditionIndex : 2,
      editingId: id
    });
  },

  parseLocation: function(location) {
    let locationDetails = { province: '北京市', city: '北京市', district: '朝阳区' };
    let locationStr = '北京市朝阳区';
    
    if (location) {
      try {
        const parsed = JSON.parse(location);
        locationDetails = {
          province: parsed.province || '北京市',
          city: parsed.city || '北京市',
          district: parsed.district || '朝阳区'
        };
        locationStr = parsed.location || `${locationDetails.province}${locationDetails.city}${locationDetails.district}`;
      } catch (e) {
        locationStr = location;
      }
    }
    return { locationStr, locationDetails };
  },

  getImages: function(data, type) {
    const imageKey = type === 'wish' ? 'wishImageList' : 'itemImageList';
    return data[imageKey] || (data.firstImage ? [data.firstImage] : []);
  },

  getUpdatedTags: function(tagsStr) {
    const savedTags = tagsStr ? tagsStr.split(',').filter(tag => tag.trim()) : [];
    return this.data.tags.map(tag => ({
      ...tag,
      selected: savedTags.includes(tag.name)
    }));
  },

  buildFormData: function(data, type, locationStr) {
    const formData = {
      title: type === 'wish' ? (data.wishTitle || '') : (data.itemTitle || ''),
      description: type === 'wish' ? (data.wishDescription || '') : (data.itemDescription || ''),
      price: type === 'wish' ? '' : (data.price ? data.price.toString() : ''),
      category: data.category || '数码3C',
      wechat: data.wechat || '',
      phone: data.phone || '',
      location: locationStr,
      latitude: data.latitude,
      longitude: data.longitude,
      wantItem: type === 'wish' ? '' : (data.wantItem || ''),
      budget: type === 'wish' ? (data.budget || '') : '',
      condition: type === 'wish' ? '9成新' : this.getConditionLabel(data.depreciation),
      contactVisibility: data.contactVisibility || 'both'
    };
    return formData;
  },

  getConditionIndex: function(depreciation) {
    const conditionMap = { 1: '全新', 2: '95成新', 3: '9成新', 4: '8成新', 5: '7成新', 6: '6成新', 7: '5成新及以下' };
    const conditionLabel = conditionMap[depreciation] || '9成新';
    return this.data.conditions.indexOf(conditionLabel);
  },

  getConditionLabel: function(depreciation) {
    const conditionMap = { 1: '全新', 2: '95成新', 3: '9成新', 4: '8成新', 5: '7成新', 6: '6成新', 7: '5成新及以下' };
    return conditionMap[depreciation] || '9成新';
  },

  selectPublishType: function(e) {
    this.setData({ publishType: e.currentTarget.dataset.type });
  },

  backToTypeSelect: function() {
    this.setData({ publishType: null });
  },

  handleUploadImage: function() {
    const { images } = this.data;
    if (images.length >= 9) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImages(res.tempFilePaths);
      }
    });
  },

  uploadImages: async function(tempFilePaths) {
    const { images } = this.data;
    const uploadedImages = [...images];

    for (const tempFilePath of tempFilePaths) {
      try {
        wx.showLoading({ title: '上传中...', mask: true });
        const uploadResult = await fileAPI.uploadImage(tempFilePath);
        uploadedImages.push(uploadResult.data.fileUrl);
        this.setData({ images: uploadedImages });
      } catch (error) {
        console.error('图片上传失败:', error);
        wx.showToast({ title: '图片上传失败，请重试', icon: 'none' });
      } finally {
        wx.hideLoading();
      }
    }
  },

  handleImageChange: function(e) {
    const { images } = e.detail;
    this.setData({ images });
  },

  removeImage: function(e) {
    const { images } = this.data;
    images.splice(e.currentTarget.dataset.index, 1);
    this.setData({ images });
  },

  updateFormData: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const { formData } = this.data;
    
    if (MAX_LENGTHS[field] && value.length > MAX_LENGTHS[field]) {
      wx.showToast({ title: `最多输入${MAX_LENGTHS[field]}个字符`, icon: 'none' });
      return;
    }
    
    if (field === 'phone' && value && !/^1[3-9]\d{9}$/.test(value)) {
      wx.showToast({ title: '请输入合法的手机号', icon: 'none' });
      return;
    }
    
    formData[field] = value;
    this.setData({ formData });
  },

  onCategoryChange: function(e) {
    const { categories, formData } = this.data;
    const index = e.detail.value;
    this.setData({
      categoryIndex: index,
      formData: { ...formData, category: categories[index] }
    });
  },

  onConditionChange: function(e) {
    const { conditions, formData } = this.data;
    const index = e.detail.value;
    this.setData({
      conditionIndex: index,
      formData: { ...formData, condition: conditions[index] }
    });
  },

  openLocationPicker: function() {
    wx.navigateTo({ url: '/pages/location/location' });
  },

  updateContactVisibility: function(e) {
    const { formData } = this.data;
    this.setData({ formData: { ...formData, contactVisibility: e.currentTarget.dataset.value } });
  },

  toggleTag: function(e) {
    const tagName = e.currentTarget.dataset.tag;
    const { tags } = this.data;
    const tagIndex = tags.findIndex(tag => tag.name === tagName);
    
    if (tagIndex === -1) return;
    
    const selectedCount = tags.filter(tag => tag.selected).length;
    
    if (tags[tagIndex].selected) {
      tags[tagIndex].selected = false;
    } else if (selectedCount < 3) {
      tags[tagIndex].selected = true;
    } else {
      wx.showToast({ title: '最多选择3个标签', icon: 'none' });
      return;
    }
    
    this.setData({ tags });
  },

  toggleAgreed: function() {
    const newAgreed = !this.data.agreed;
    
    if (newAgreed) {
      this.setData({ scrollToView: 'disclaimer-section', readCountdown: 5 });
      
      const timer = setInterval(() => {
        this.setData({ readCountdown: this.data.readCountdown - 1 });
        if (this.data.readCountdown <= 0) {
          clearInterval(timer);
          this.setData({ canPublish: true });
        }
      }, 1000);
    } else {
      this.setData({ canPublish: false, readCountdown: 0, scrollToView: '' });
    }
    
    this.setData({ agreed: newAgreed });
  },

  toggleContactSettings: function() {
    this.setData({ contactSettingsExpanded: !this.data.contactSettingsExpanded });
  },

  handlePublish: async function() {
    const { agreed, formData, publishType, images, canPublish, editingId, isSubmitting } = this.data;

    if (isSubmitting) return;
    if (!agreed) { wx.showToast({ title: '请同意免责声明', icon: 'none' }); return; }
    if (!canPublish) { wx.showToast({ title: '请完成免责声明阅读', icon: 'none' }); return; }
    if (!formData.title) { wx.showToast({ title: '请填写标题', icon: 'none' }); return; }

    if (!this.validateContact(formData)) return;
    if (publishType === 'sell' && !formData.price) { wx.showToast({ title: '请填写价格', icon: 'none' }); return; }
    if (publishType === 'exchange' && !formData.wantItem) { wx.showToast({ title: '请填写我想要的物品', icon: 'none' }); return; }
    if (publishType === 'wish' && !formData.budget) { wx.showToast({ title: '请填写预期价格或交换条件', icon: 'none' }); return; }
    if (publishType !== 'wish' && images.length === 0) { wx.showToast({ title: '请上传至少一张图片', icon: 'none' }); return; }

    this.setData({ isSubmitting: true });

    try {
      const locationData = {
        province: this.data.locationDetails.province || '',
        city: this.data.locationDetails.city || '',
        district: this.data.locationDetails.district || '',
        location: formData.location
      };

      const result = await this.submitData(publishType, editingId, formData, images, locationData);
      
      if (result && result.success) {
        this.handlePublishSuccess(editingId);
      } else {
        throw new Error(result && result.desc || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      wx.showToast({ title: '发布失败，请重试', icon: 'none' });
      this.setData({ isSubmitting: false });
    }
  },

  validateContact: function(formData) {
    if (formData.contactVisibility === 'both') {
      if (!formData.wechat) { wx.showToast({ title: '请填写微信', icon: 'none' }); return false; }
      if (!formData.phone) { wx.showToast({ title: '请填写电话', icon: 'none' }); return false; }
    } else if (formData.contactVisibility === 'wechat' && !formData.wechat) {
      wx.showToast({ title: '请填写微信', icon: 'none' });
      return false;
    } else if (formData.contactVisibility === 'phone' && !formData.phone) {
      wx.showToast({ title: '请填写电话', icon: 'none' });
      return false;
    }
    return true;
  },

  submitData: async function(publishType, editingId, formData, images, locationData) {
    const baseData = {
      location: JSON.stringify(locationData),
      latitude: formData.latitude || 39.9042,
      longitude: formData.longitude || 116.4074,
      wechat: formData.contactVisibility === 'phone' ? null : formData.wechat,
      phone: formData.contactVisibility === 'wechat' ? null : formData.phone,
      contactVisibility: formData.contactVisibility,
      tags: this.getSelectedTags()
    };

    if (publishType === 'wish') {
      const wishData = {
        ...baseData,
        wishTitle: formData.title,
        wishDescription: formData.description,
        wishImageList: images,
        category: formData.category,
        budget: formData.budget
      };
      return editingId ? await wishAPI.updateWish(editingId, wishData) : await wishAPI.publishWish(wishData);
    } else {
      const itemData = {
        ...baseData,
        itemTitle: formData.title,
        itemDescription: formData.description,
        itemImageList: images,
        depreciation: this.getDepreciationValue(formData.condition),
        price: formData.price,
        category: formData.category,
        tradeType: publishType,
        wantItem: formData.wantItem
      };
      return editingId ? await itemAPI.updateItem(editingId, itemData) : await itemAPI.publishItem(itemData);
    }
  },

  handlePublishSuccess: function(editingId) {
    this.setData({ isSubmitting: false });
    
    wx.showToast({ title: editingId ? '编辑成功！' : '发布成功！', icon: 'success', duration: 1500 });
    
    setTimeout(() => {
      this.setData(getDefaultData());
      wx.switchTab({ url: '/pages/profile/profile' });
    }, 1500);
  },

  getDepreciationValue: function(condition) {
    return CONDITION_MAP[condition] || 5;
  },

  getSelectedTags: function() {
    return this.data.tags.filter(tag => tag.selected).map(tag => tag.name).join(',');
  }
});
