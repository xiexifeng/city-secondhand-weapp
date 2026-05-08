// 导入工具
const { formatDate } = require('../../utils/format');
const { getReviewStatusLabel, getReviewStatusClass, getTransferStatusLabel, getTransferStatusClass } = require('../../utils/enums');
const { TRANSFER_STATUS } = require('../../utils/enums');

Page({
  data: {
    items: [],
    statusCounts: {
      transferring: 0,
      transfer_accepted: 0,
      transferred: 0
    },
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false
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
    
    // 从后端API获取我的物品列表
    this.getMyItems();
  },
  
  /**
   * 获取我的物品列表
   */
  getMyItems: function(isRefresh = false) {
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    
    const api = require('../../utils/api');
    api.itemAPI.getMyItems({
      pageNo: isRefresh ? 1 : this.data.pageNo,
      pageSize: this.data.pageSize
    })
      .then(res => {
        // 检查后端返回的响应格式
        if (res) {
          // 转换数据格式
          const items = res.map(item => {
            // 解析位置信息
            let location = '';
            try {
              const locationData = JSON.parse(item.location);
              location = locationData.location || `${locationData.province}${locationData.city}${locationData.district}`;
            } catch (e) {
              location = item.location || '';
            }
            
            return {
              id: item.id,
              title: item.itemTitle,
              price: item.price,
              image: item.firstImage,
              category: item.category,
              description: item.itemDescription,
              status: item.status,
              reviewStatusLabel: getReviewStatusLabel(item.status),
              reviewStatusClass: getReviewStatusClass(item.status),
              transferStatus: item.transferStatus,
              transferStatusLabel: getTransferStatusLabel(item.transferStatus),
              transferStatusClass: getTransferStatusClass(item.transferStatus),
              views: item.views || 0,
              likes: item.likes || 0,
              favorites: item.favorites || 0,
              publishDate: item.createTime ? formatDate(item.createTime) : formatDate(Date.now()),
              transactionType: item.tradeType,             
              location: location,
              urgent: item.urgent || false
            };
          });
          
          const newItems = isRefresh ? items : [...this.data.items, ...items];
          this.setData({ 
            items: newItems,
            hasMore: items.length >= this.data.pageSize
          });
          this.calculateStatusCounts();
        } else {
          if (isRefresh) {
            this.setData({ items: [], hasMore: true });
          }
          this.calculateStatusCounts();
        }
      })
      .catch(err => {
        console.log('获取物品列表失败:', err);
      })
      .finally(() => {
        this.setData({ isLoading: false });
      });
  },

  /**
   * Calculate status counts
   */
  calculateStatusCounts: function() {
    const items = this.data.items;
    const statusCounts = {
      transferring: items.filter(item => item.transferStatus === TRANSFER_STATUS.TRANSFERRING).length,
      transfer_accepted: items.filter(item => item.transferStatus === TRANSFER_STATUS.TRANSFER_ACCEPTED).length,
      transferred: items.filter(item => item.transferStatus === TRANSFER_STATUS.TRANSFERRED).length
    };
    this.setData({ statusCounts });
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



  /**
   * Handle edit
   */
  handleEdit: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Edit button clicked, item id:', id);
    this.setData({ activeMenu: null });
    // 存储编辑ID到全局数据
    getApp().globalData.editItemId = id;
    wx.switchTab({
      url: '/pages/publish/publish',
      success: function(res) {
        console.log('Switch tab success:', res);
      },
      fail: function(res) {
        console.log('Switch tab fail:', res);
      }
    });
  },



  /**
   * Handle status change
   */
  handleStatusChange: function(e) {
    const id = e.currentTarget.dataset.id;
    const newTransferStatus = e.currentTarget.dataset.status;
    const { items } = this.data;
    
    const transferStatusLabels = {
      'own': '待发布',
      'transferring': '发布中',
      'transfer_accepted': '已接受',
      'transferred': '已转让',
      'transfer_cancelled': '已取消'
    };
    
    const actualStatusLabel = transferStatusLabels[newTransferStatus] || newTransferStatus;
    
    
    let confirmContent = '确定要将物品状态更新为: ' + actualStatusLabel + ' 吗？';
    
    if (newTransferStatus === 'transfer_accepted') {
      confirmContent = '设置为"已接受"表示您已与买家沟通清楚，即将进行交易。\n\n确定要将物品状态更新为"已接受"吗？';
    }
    
    wx.showModal({
      title: '确认操作',
      content: confirmContent,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新中...'
          });
          
          const api = require('../../utils/api');
          api.itemAPI.updateTransferStatus(id, newTransferStatus)
            .then(res => {
              wx.hideLoading();
              
              if (res && res.success) {
                const updatedItems = items.map(i => {
                  if (i.id === id) {
                    return {
                      ...i, 
                      transferStatus: newTransferStatus,
                      transferStatusLabel: getTransferStatusLabel(newTransferStatus),
                      transferStatusClass: getTransferStatusClass(newTransferStatus)
                    };
                  }
                  return i;
                });
                
                this.setData({
                  items: updatedItems
                });
                
                this.calculateStatusCounts();
                
                wx.showToast({
                  title: actualStatusLabel,
                  icon: 'success',
                  duration: 2000
                });
              } else {
                wx.showToast({
                  title: '更新失败',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '更新失败',
                icon: 'none'
              });
              console.log('更新状态失败:', err);
            });
        }
      }
    });
  },

  /**
   * Handle urgent
   */
  handleUrgent: function(e) {
    const id = e.currentTarget.dataset.id;
    const { items } = this.data;
    const item = items.find(i => i.id === id);
    const newUrgent = item.urgent ? false : true;
    const actionText = newUrgent ? '加急' : '取消加急';
    
    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}这件物品吗？`,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新中...'
          });
          
          const api = require('../../utils/api');
          api.itemAPI.updateUrgent(id, newUrgent)
            .then(res => {
              wx.hideLoading();
              
              const updatedItems = items.map(i => {
                if (i.id === id) {
                  return {
                    ...i, 
                    urgent: newUrgent
                  };
                }
                return i;
              });
              
              this.setData({
                items: updatedItems
              });
              
              wx.showToast({
                title: actionText + '成功',
                icon: 'success',
                duration: 2000
              });
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '操作失败',
                icon: 'none'
              });
              console.log('加急操作失败:', err);
            });
        }
      }
    });
  },

  /**
   * Handle more actions
   */
  handleMoreActions: function(e) {
    const id = e.currentTarget.dataset.id;
    const transferStatus = e.currentTarget.dataset.transferstatus;
    
    let menuItems = [];
    
    switch (transferStatus) {
      case 'own':
        menuItems = [
          { label: '删除', action: 'delete' },
          { label: '编辑', action: 'edit' }
        ];
        break;
      case 'transferring':
        menuItems = [
          { label: '删除', action: 'delete' },
          { label: '取消发布', action: 'status', status: 'transfer_cancelled' }
        ];
        break;
      case 'transfer_accepted':
        menuItems = [
          { label: '删除', action: 'delete' },
          { label: '取消发布', action: 'status', status: 'transfer_cancelled' }
        ];
        break;
      case 'transferred':
        menuItems = [
          { label: '删除', action: 'delete' }
        ];
        break;
      case 'transfer_cancelled':
        menuItems = [
          { label: '删除', action: 'delete' }
        ];
        break;
      default:
        menuItems = [
          { label: '删除', action: 'delete' }
        ];
    }
    
    const itemList = menuItems.map(item => item.label);
    
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        const selected = menuItems[res.tapIndex];
        
        if (selected.action === 'delete') {
          this.handleDelete({
            currentTarget: {
              dataset: { id: id }
            }
          });
        } else if (selected.action === 'edit') {
          this.handleEdit({
            currentTarget: {
              dataset: { id: id }
            }
          });
        } else if (selected.action === 'status') {
          this.handleStatusChange({
            currentTarget: {
              dataset: {
                id: id,
                status: selected.status
              }
            }
          });
        }
      },
      fail: () => {
        console.log('取消操作');
      }
    });
  },

  /**
   * Handle delete
   */
  handleDelete: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除物品',
      content: '确定要删除这个物品吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          });
          
          const api = require('../../utils/api');
          api.itemAPI.deleteItem(id)
            .then(res => {
              wx.hideLoading();
              
              if (res && res.success) {
                const items = this.data.items.filter(item => item.id !== id);
                this.setData({ items });
                this.calculateStatusCounts();
                wx.showToast({
                  title: '物品已删除',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
              console.log('删除物品失败:', err);
            });
        }
      }
    });
  },

  /**
   * Pull down refresh
   */
  onPullDownRefresh: function() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      items: []
    });
    this.getMyItems(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * Scroll to bottom load more
   */
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({ pageNo: this.data.pageNo + 1 });
      this.getMyItems();
    }
  }

});
