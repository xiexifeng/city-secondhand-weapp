// 导入工具
const { formatDate } = require('../../utils/format');
const { getReviewStatusLabel, getReviewStatusClass, getTransferStatusLabel, getTransferStatusClass } = require('../../utils/enums');
const { TRANSFER_STATUS } = require('../../utils/enums');

Page({
  data: {
    items: [
      {
        id: 1,
        title: 'iPhone 14 Pro Max',
        price: 5800,
        image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '9成新，无划痕，原装配件齐全',
        status: '在售',
        views: 245,
        likes: 18,
        favorites: 12,
        publishDate: '2024-03-20',
        transactionType: '人民币',
        reviewStatus: '已通过',
        location: '北京市朝阳区',
        statusClass: 'status-on-sale',
        reviewStatusClass: 'review-approved',
        reviewStatusLabel: '✓ 已通过'
      },
      {
        id: 2,
        title: 'MacBook Pro 2019',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '13寸，i5处理器，8GB内存，256GB SSD',
        status: '已成交',
        views: 312,
        likes: 42,
        favorites: 28,
        publishDate: '2024-03-15',
        transactionType: '人民币',
        reviewStatus: '已通过',
        location: '北京市朝阳区',
        statusClass: 'status-completed',
        reviewStatusClass: 'review-approved',
        reviewStatusLabel: '✓ 已通过'
      },
      {
        id: 3,
        title: 'Sony A6400 相机',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
        category: '数码3C',
        description: '微单相机，配16-50mm镜头，完美状态',
        status: '成交中',
        views: 156,
        likes: 12,
        favorites: 8,
        publishDate: '2024-03-18',
        transactionType: '都可以',
        reviewStatus: '待审核',
        location: '北京市朝阳区',
        statusClass: 'status-trading',
        reviewStatusClass: 'review-pending',
        reviewStatusLabel: '⏳ 待审核'
      },
      {
        id: 4,
        title: 'Nike 跑鞋',
        price: 599,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        category: '服装鞋帽',
        description: '全新未穿，官方正品，尺码42',
        status: '已下架',
        views: 89,
        likes: 5,
        favorites: 3,
        publishDate: '2024-03-19',
        transactionType: '人民币',
        reviewStatus: '审核不通过',
        rejectionReason: '图片质量低',
        location: '北京市朝阳区',
        statusClass: 'status-offline',
        reviewStatusClass: 'review-rejected',
        reviewStatusLabel: '✕ 审核不通过'
      }
    ],
    statusCounts: {
      
      transferring: 0,
      transfer_accepted: 0,
      transferred: 0
    }
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
  getMyItems: function() {
    wx.showLoading({
      title: '加载中...'
    });
    
    const api = require('../../utils/api');
    api.itemAPI.getMyItems({})
      .then(res => {
        wx.hideLoading();
        
        // 检查后端返回的响应格式
        if (res && res.success && res.data) {
          // 转换数据格式
          const items = res.data.map(item => {
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
              location: location
              
            };
          });
          console.log(items);
          
          this.setData({ items });
          this.calculateStatusCounts();
        } else {
          wx.showToast({
            title: '获取物品列表失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '获取物品列表失败',
          icon: 'none'
        });
        console.log('获取物品列表失败:', err);
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


});
