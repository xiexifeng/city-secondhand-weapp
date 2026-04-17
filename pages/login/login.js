Page({
  data: {
    loginMethod: 'select', // 'select' | 'sms'
    phoneNumber: '',
    verificationCode: '',
    codeSent: false,
    codeCountdown: 60,
    isLoggingIn: false,
    showAgreementModal: false,
    agreementTitle: '',
    agreementContent: ''
  },

  onLoad: function() {
    // Check if already logged in
    const token = wx.getStorageSync('authToken');
    if (token) {
      wx.redirectTo({
        url: '/pages/home/home'
      });
    }
  },

  /**
   * Handle WeChat phone number login
   */
  handleWechatPhoneLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // Get phone number from WeChat
          this.getPhoneNumber(res.code);
        }
      }
    });
  },

  /**
   * Get phone number from WeChat
   */
  getPhoneNumber: function(code) {
    // In real app, call backend API to get encrypted phone number
    // For demo, show success message
    wx.showLoading({
      title: '登录中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      
      // Simulate successful login
      wx.setStorageSync('authToken', 'wechat_token_' + Date.now());
      wx.setStorageSync('userPhone', '138****0000');
      
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/home/home'
        });
      }, 1500);
    }, 1500);
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

    // Simulate API call
    setTimeout(() => {
      wx.hideLoading();
      
      this.setData({ codeSent: true });
      wx.showToast({
        title: '验证码已发送',
        icon: 'success',
        duration: 1500
      });

      // Start countdown
      this.startCodeCountdown();
    }, 1000);
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
    const { phoneNumber, verificationCode, isLoggingIn } = this.data;

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

    // Simulate API call
    setTimeout(() => {
      this.setData({ isLoggingIn: false });

      // Simulate successful login
      wx.setStorageSync('authToken', 'sms_token_' + Date.now());
      wx.setStorageSync('userPhone', phoneNumber);

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/home/home'
        });
      }, 1500);
    }, 1500);
  },

  /**
   * Open agreement
   */
  openAgreement: function(e) {
    const type = e.currentTarget.dataset.type;
    
    let title = '';
    let content = '';

    if (type === 'service') {
      title = '服务协议';
      content = `换换么服务协议

本服务协议（以下简称"本协议"）是由换换么（以下简称"我们"或"平台"）与用户（以下简称"您"）就使用本平台服务所达成的协议。

1. 服务内容
换换么是一个城市二手物品交易平台，为用户提供物品发布、浏览、交易等服务。

2. 用户责任
用户同意：
- 遵守相关法律法规
- 不发布违法、违规内容
- 不进行欺诈、骚扰等不当行为
- 保护个人隐私和账户安全

3. 平台权利
平台有权：
- 审核和删除违规内容
- 暂停或终止违规用户账户
- 修改服务条款和功能

4. 免责声明
平台不对用户之间的交易纠纷负责，用户应自行协商解决。

5. 其他条款
本协议的最终解释权归换换么所有。`;
    } else if (type === 'privacy') {
      title = '隐私政策';
      content = `换换么隐私政策

我们重视您的隐私，本隐私政策说明我们如何收集、使用和保护您的个人信息。

1. 信息收集
我们收集以下信息：
- 手机号码
- 微信账户信息
- 交易记录
- 浏览历史

2. 信息使用
我们使用您的信息用于：
- 提供和改进服务
- 进行身份验证
- 处理交易
- 发送通知

3. 信息保护
我们采取措施保护您的信息安全，包括：
- 加密存储
- 访问控制
- 定期审计

4. 信息共享
我们不会与第三方共享您的信息，除非：
- 获得您的同意
- 法律要求
- 必要的业务合作

5. 您的权利
您有权：
- 访问您的个人信息
- 更正错误信息
- 删除账户

6. 联系我们
如有隐私问题，请联系我们。`;
    }

    this.setData({
      showAgreementModal: true,
      agreementTitle: title,
      agreementContent: content
    });
  },

  /**
   * Close agreement modal
   */
  closeAgreementModal: function() {
    this.setData({ showAgreementModal: false });
  }
});
