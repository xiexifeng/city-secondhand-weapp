const { wishAPI } = require('../../utils/api');
const { WISH_STATUS, WISH_STATUS_LABELS, getWishStatusClass } = require('../../utils/enums');

Page({
  data: {
    activeCount: 0,
    totalInterests: 0,
    totalViews: 0,
    activeWishes: [],
    archivedWishes: [],
    activeMenu: null,
    wishes: []
  },

  onLoad: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    this.loadWishes();
  },

  loadWishes: async function() {
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const result = await wishAPI.getMyWishes({ pageNo: 1, pageSize: 100 });
      
      if (result && result.success && result.data) {
        const wishes = result.data.map(wish => {
          const wishStatus = wish.status || WISH_STATUS.AUDITING;
          const statusLabel = WISH_STATUS_LABELS[wishStatus] || '待审核';
          const statusClass = getWishStatusClass(wishStatus);
          const isActive = [WISH_STATUS.AUDITING, WISH_STATUS.ACTIVE].includes(wishStatus);
          
          return {
            id: wish.id,
            title: wish.wishTitle || '',
            description: wish.wishDescription || '',
            category: wish.category || '',
            budget: wish.budget || '',
            status: wishStatus,
            statusLabel: statusLabel,
            statusClass: statusClass,
            isActive: isActive,
            createdAt: wish.createTime ? this.formatDate(wish.createTime) : '',
            views: wish.views || 0,
            interests: wish.likes || 0,
            favorites: wish.favorites || 0,
            rejectionReason: wish.remark || ''
          };
        });
        
        this.setData({ wishes });
        this.computeStats();
      } else {
        this.setData({ wishes: [] });
        this.computeStats();
      }
    } catch (error) {
      console.error('加载心愿列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  formatDate: function(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getReviewStatus: function(status) {
    const statusMap = {
      'auditing': '待审核',
      'active': '已通过',
      'inactive': '审核不通过'
    };
    return statusMap[status] || '待审核';
  },

  /**
   * Compute stats and set data
   */
  computeStats: function() {
    const { wishes } = this.data;
    
    const activeCount = wishes.filter(w => w.isActive).length;
    const totalInterests = wishes.reduce((sum, w) => sum + w.interests, 0);
    const totalViews = wishes.reduce((sum, w) => sum + w.views, 0);
    const activeWishes = wishes.filter(w => w.isActive);
    const archivedWishes = wishes.filter(w => !w.isActive);
    
    this.setData({
      activeCount,
      totalInterests,
      totalViews,
      activeWishes,
      archivedWishes
    });
  },





  /**
   * Handle edit
   */
  handleEdit: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log('handleEdit clicked, id:', id);
    const app = getApp();
    app.globalData.editWishId = id;
    console.log('editWishId set to:', app.globalData.editWishId);
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },



  /**
   * Handle withdraw wish (撤回心愿)
   */
  handleWithdraw: async function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '撤回心愿',
      content: '确定要撤回这个心愿吗？撤回后可以重新发布。',
      confirmText: '确定撤回',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '撤回中...' });
          try {
            const result = await wishAPI.updateWishStatus(id, WISH_STATUS.CANCELLED);
            if (result && result.success) {
              this.loadWishes();
              wx.showToast({
                title: '心愿已撤回',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '撤回失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('撤回心愿失败:', error);
            wx.showToast({
              title: '撤回失败',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  /**
   * Handle achieve wish (心愿达成)
   */
  handleAchieve: async function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '心愿达成',
      content: '确定要标记心愿已达成吗？',
      confirmText: '确定达成',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          try {
            const result = await wishAPI.updateWishStatus(id, WISH_STATUS.ACHIEVED);
            if (result && result.success) {
              this.loadWishes();
              wx.showToast({
                title: '心愿已达成',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('心愿达成失败:', error);
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  /**
   * Handle delete
   */
  handleDelete: async function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除心愿',
      content: '确定要删除这个心愿吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            const result = await wishAPI.deleteWish(id);
            if (result && result.success) {
              const updatedWishes = this.data.wishes.filter(w => w.id !== id);
              this.setData({
                wishes: updatedWishes
              });
              this.computeStats();
              wx.showToast({
                title: '心愿已删除',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('删除心愿失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  onShow: function() {
    this.loadWishes();
  },

  /**
   * Go back
   */
  goBack: function() {
    wx.navigateBack();
  },

  /**
   * Navigate to publish
   */
  navigateToPublish: function() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },


});
