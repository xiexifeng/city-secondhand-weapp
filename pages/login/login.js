Page({
  data: {
    loginMethod: 'select', // 'select' | 'sms'
    phoneNumber: '',
    verificationCode: '',
    codeSent: false,
    codeCountdown: 60,
    isLoggingIn: false,
    isWechatLoggingIn: false,
    showAgreementModal: false,
    agreementTitle: '',
    agreementContent: '',
    agreementChecked: false,
    inviterId: ''  // 邀请者ID
  },

  onLoad: function(options) {
    // 先解析分享参数中的邀请者ID（无论是否登录都需要处理）
    if (options && options.inviterId) {
      this.setData({ inviterId: options.inviterId });
      wx.setStorageSync('inviterId', options.inviterId);
      console.log('邀请者ID:', options.inviterId);
    }

    // Check if already logged in
    this.checkLoginStatus();
  },

  onShow: function() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus: function() {
    const app = getApp();
    if (app.isLoggedIn()) {
      console.log('已登录，跳转到首页');
      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  },

  onGetPhoneNumber(e) {
    // Check agreement
    if (!this.checkAgreement()) {
      return;
    }

    if (this.data.isWechatLoggingIn) {
      return;
    }
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      wx.login({
        success: (res) => {
          if (res.code) {
            this.getPhoneNumber(res.code, e.detail);
          }
        }
      });
    } else {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'none'
      });
    }
  },
  /**
   * Get phone number from WeChat
   */
  getPhoneNumber: function(code, phoneDetail) {
    const { inviterId, isWechatLoggingIn } = this.data;
    
    if (isWechatLoggingIn) return;
    this.setData({ isWechatLoggingIn: true });

    wx.showLoading({
      title: '登录中...'
    });

    const api = require('../../utils/api');
    const app = getApp();
    
    api.userAPI.wechatLogin(code, phoneDetail.encryptedData, phoneDetail.iv, inviterId)
      .then(res => {
        wx.hideLoading();
        this.setData({ isWechatLoggingIn: false });

        app.saveLoginInfo(res.token, res.phone, res.userContext);

        // 清除临时保存的邀请者ID
        wx.removeStorageSync('inviterId');

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        setTimeout(() => {
          app.navigateAfterLogin();
        }, 1500);
      })
      .catch(err => {
        wx.hideLoading();
        this.setData({ isWechatLoggingIn: false });
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      });
  },

  /**
   * Switch to SMS login
   */
  switchToSmsLogin: function() {
    this.setData({ loginMethod: 'sms' });
  },

  /**
   * Back to select method
   */
  backToSelect: function() {
    this.setData({
      loginMethod: 'select',
      phoneNumber: '',
      verificationCode: '',
      codeSent: false,
      codeCountdown: 60
    });
  },

  /**
   * Handle phone number input
   */
  onPhoneChange: function(e) {
    this.setData({ phoneNumber: e.detail.value });
  },

  /**
   * Handle verification code input
   */
  onCodeChange: function(e) {
    this.setData({ verificationCode: e.detail.value });
  },

  /**
   * Send verification code
   */
  sendVerificationCode: function() {
    // Check agreement
    if (!this.checkAgreement()) {
      return;
    }

    const { phoneNumber, codeSent } = this.data;

    if (codeSent) {
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      });
      return;
    }

    // Show loading
    wx.showLoading({
      title: '发送验证码中...'
    });

    // Call real API
    const api = require('../../utils/api');
    api.userAPI.sendSms(phoneNumber)
      .then(res => {
        wx.hideLoading();
        this.setData({ codeSent: true });
        wx.showToast({
          title: '验证码已发送',
          icon: 'success',
          duration: 1500
        });

        // Start countdown
        this.startCodeCountdown();
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '发送验证码失败',
          icon: 'none'
        });
      });
  },

  /**
   * Start code countdown
   */
  startCodeCountdown: function() {
    let countdown = 60;
    const timer = setInterval(() => {
      countdown--;
      this.setData({ codeCountdown: countdown });

      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          codeSent: false,
          codeCountdown: 60
        });
      }
    }, 1000);
  },

  /**
   * Handle SMS login
   */
  handleSmsLogin: function() {
    const { phoneNumber, verificationCode, isLoggingIn, inviterId } = this.data;

    if (isLoggingIn) {
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      wx.showToast({
        title: '请输入正确的验证码',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoggingIn: true });

    // Call real API
    const api = require('../../utils/api');
    const app = getApp();
    // 传递邀请者ID
    api.userAPI.loginOrRegister(phoneNumber, verificationCode, inviterId)
      .then(res => {
        this.setData({ isLoggingIn: false });

        app.saveLoginInfo(res.token, res.phone, res.userContext);

        // 清除临时保存的邀请者ID
        wx.removeStorageSync('inviterId');

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        setTimeout(() => {
          app.navigateAfterLogin();
        }, 1500);
      })
      .catch(err => {
        this.setData({ isLoggingIn: false });
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      });
  },

  /**
   * Navigate to terms of service page
   */
  navigateToTerms: function() {
    wx.navigateTo({
      url: '/pages/terms-of-service/terms-of-service'
    });
  },

  /**
   * Navigate to privacy policy page
   */
  navigateToPrivacy: function() {
    wx.navigateTo({
      url: '/pages/privacy-policy/privacy-policy'
    });
  },

  /**
   * Toggle agreement checkbox
   */
  toggleAgreement: function() {
    this.setData({
      agreementChecked: !this.data.agreementChecked
    });
  },

  /**
   * Check if agreement is checked
   */
  checkAgreement: function() {
    if (!this.data.agreementChecked) {
      wx.showToast({
        title: '请先阅读并同意服务协议和隐私政策',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  /**
   * Handle page unload (including back button)
   */
  onUnload: function() {
    // 用户点返回时，wx.navigateTo 会自然回到上一页，无需额外处理
  }
});
