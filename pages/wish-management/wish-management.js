const { wishAPI } = require('../../utils/api');
const { WISH_STATUS, WISH_STATUS_LABELS, getWishStatusClass } = require('../../utils/enums');
const app = getApp()
Page({
  data: {
    stats: {
      totalCount: 0,
      auditing: 0,
      active: 0,
      achieved: 0,
      cancelled: 0
    },
    activeFilter: '',
    activeMenu: null,
    wishes: [],
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false
  },

  onLoad: function() {
    const app = getApp();
    if (!app.requireLogin()) return;
    this.loadWishStats();
    this.loadWishes(true);
  },

  /**
   * 点击统计卡片过滤
   */
  handleFilterTap: function(e) {
    const filter = e.currentTarget.dataset.filter;
    const currentFilter = this.data.activeFilter;
    
    // 再次点击同一过滤条件则取消过滤
    const newFilter = currentFilter === filter ? '' : filter;
    
    this.setData({ 
      activeFilter: newFilter, 
      pageNo: 1, 
      hasMore: true, 
      wishes: [] 
    });
    this.loadWishes(true);
  },

  loadWishes: async function(isRefresh = false) {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    try {
      const params = { 
        pageNo: isRefresh ? 1 : this.data.pageNo, 
        pageSize: this.data.pageSize 
      };
      
      // 根据过滤条件设置status参数
      if (this.data.activeFilter) {
        params.status = this.data.activeFilter;
      }
      
      const result = await wishAPI.getMyWishes(params);
      
      if (result) {
        const wishes = result.map(wish => {
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
        
        const newWishes = isRefresh ? wishes : [...this.data.wishes, ...wishes];
        this.setData({ 
          wishes: newWishes,
          hasMore: wishes.length >= this.data.pageSize
        });
      } else {
        if (isRefresh) {
          this.setData({ wishes: [], hasMore: true });
        }
      }
    } catch (error) {
      console.error('加载心愿列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
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

  /**
   * 加载心愿统计数据
   */
  loadWishStats: function() {
    wishAPI.getMyWishStats()
      .then(res => {
        if (res) {
          this.setData({
            stats: {
              totalCount: res.totalCount || 0,
              auditing: res.auditing || 0,
              active: res.active || 0,
              achieved: res.achieved || 0,
              cancelled: res.cancelled || 0
            }
          });
        }
      })
      .catch(err => {
        console.log('获取心愿统计失败:', err);
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
              this.setData({ pageNo: 1, hasMore: true, wishes: [] });
              this.loadWishStats();
              await this.loadWishes(true);
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
              this.setData({ pageNo: 1, hasMore: true, wishes: [] });
              this.loadWishStats();
              await this.loadWishes(true);
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
              this.loadWishStats();
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
    this.loadWishStats();
    this.setData({ pageNo: 1, hasMore: true, wishes: [] });
    this.loadWishes(true);
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
    app.globalData.publishType = 'wish';
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },

  /**
   * Pull down refresh
   */
  onPullDownRefresh: function() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      wishes: []
    });
    this.loadWishStats();
    this.loadWishes(true).then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * Scroll to bottom load more
   */
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({ pageNo: this.data.pageNo + 1 });
      this.loadWishes();
    }
  }

});
