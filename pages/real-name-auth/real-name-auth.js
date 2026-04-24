Page({
  data: {
    currentStep: 1,
    steps: [
      { id: 1, label: '填写信息' },
      { id: 2, label: '上传证件' },
      { id: 3, label: '人脸验证' },
      { id: 4, label: '完成' }
    ],
    form: {
      name: '',
      idNumber: '',
      birthDate: '',
      phone: '',
      email: '',
      region: [],
      idFront: '',
      idBack: ''
    },
    authTime: ''
  },

  onLoad: function() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    // Page loaded
  },

  /**
   * Handle input change
   */
  handleInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`form.${field}`]: value
    });
  },

  /**
   * Handle date change
   */
  handleDateChange: function(e) {
    this.setData({
      'form.birthDate': e.detail.value
    });
  },

  /**
   * Handle region change
   */
  handleRegionChange: function(e) {
    this.setData({
      'form.region': e.detail.value
    });
  },

  /**
   * Upload ID front
   */
  uploadIdFront: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'form.idFront': res.tempFilePaths[0]
        });
      }
    });
  },

  /**
   * Upload ID back
   */
  uploadIdBack: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'form.idBack': res.tempFilePaths[0]
        });
      }
    });
  },

  /**
   * Go to next step
   */
  goToNextStep: function() {
    const { currentStep, form } = this.data;
    
    // Validate current step
    if (currentStep === 1) {
      if (!form.name || !form.idNumber || !form.birthDate || !form.phone || form.region.length === 0) {
        wx.showToast({
          title: '请填写所有必填项',
          icon: 'none'
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!form.idFront || !form.idBack) {
        wx.showToast({
          title: '请上传身份证照片',
          icon: 'none'
        });
        return;
      }
    }

    if (currentStep < 4) {
      this.setData({
        currentStep: currentStep + 1
      });
    }
  },

  /**
   * Go to previous step
   */
  goToPreviousStep: function() {
    const { currentStep } = this.data;
    if (currentStep > 1) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },

  /**
   * Start face verification
   */
  startFaceVerification: function() {
    // Simulate face verification
    wx.showLoading({
      title: '验证中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      const now = new Date();
      const authTime = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0') + ' ' +
                      String(now.getHours()).padStart(2, '0') + ':' +
                      String(now.getMinutes()).padStart(2, '0');
      
      this.setData({
        currentStep: 4,
        authTime: authTime
      });
      
      wx.showToast({
        title: '验证成功',
        icon: 'success'
      });
    }, 2000);
  },

  /**
   * Go to profile
   */
  goToProfile: function() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  }
});
