Page({
  data: {
    // Page data
  },

  onLoad: function() {
    // Page loaded
  },

  /**
   * Navigate to page
   */
  navigateTo: function(e) {
    const page = e.currentTarget.dataset.page;
    if (page === 'terms') {
      wx.navigateTo({
        url: '/pages/terms-of-service/terms-of-service'
      });
    } else if (page === 'privacy') {
      wx.navigateTo({
        url: '/pages/privacy-policy/privacy-policy'
      });
    }
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  }
});
