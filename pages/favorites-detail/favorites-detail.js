const { collectionAPI } = require('../../utils/api.js')
const { formatDate } = require('../../utils/format.js')

Page({
  data: {
    activeTab: 'items',
    itemsList: [],
    wishesList: [],
    itemsPageNo: 1,
    wishesPageNo: 1,
    itemsHasMore: true,
    wishesHasMore: true,
    loading: false
  },

  onLoad: function(options) {
    const app = getApp()
    if (!app.requireLogin()) return
    this.loadItemsCollection()
  },

  onShow: function() {
    const app = getApp()
    if (!app.requireLogin()) return
  },

  onPullDownRefresh: function() {
    this.setData({
      itemsList: [],
      wishesList: [],
      itemsPageNo: 1,
      wishesPageNo: 1,
      itemsHasMore: true,
      wishesHasMore: true
    })
    if (this.data.activeTab === 'items') {
      this.loadItemsCollection().then(() => {
        wx.stopPullDownRefresh()
      }).catch(() => {
        wx.stopPullDownRefresh()
      })
    } else {
      this.loadWishesCollection().then(() => {
        wx.stopPullDownRefresh()
      }).catch(() => {
        wx.stopPullDownRefresh()
      })
    }
  },

  loadItemsCollection: function() {
    if (this.data.loading || !this.data.itemsHasMore) return Promise.resolve()
    
    this.setData({ loading: true })
    return collectionAPI.listMyItemCollection({
      pageNo: this.data.itemsPageNo,
      pageSize: 10
    }).then(res => {
      const newItems = (res || []).map(item => ({
        ...item,
        time: item.collectionTime ? formatDate(item.collectionTime, 'YYYY-MM-DD HH:mm') : ''
      }))
      const itemsList = this.data.itemsPageNo === 1 ? newItems : [...this.data.itemsList, ...newItems]
      this.setData({
        itemsList: itemsList,
        itemsPageNo: this.data.itemsPageNo + 1,
        itemsHasMore: newItems.length >= 10,
        loading: false
      })
    }).catch(err => {
      console.error('加载物品收藏失败', err)
      this.setData({ loading: false })
    })
  },

  loadWishesCollection: function() {
    if (this.data.loading || !this.data.wishesHasMore) return Promise.resolve()
    
    this.setData({ loading: true })
    return collectionAPI.listMyWishCollection({
      pageNo: this.data.wishesPageNo,
      pageSize: 10
    }).then(res => {
      const newWishes = (res || []).map(wish => ({
        ...wish,
        time: wish.collectionTime ? formatDate(wish.collectionTime, 'YYYY-MM-DD HH:mm') : ''
      }))
      const wishesList = this.data.wishesPageNo === 1 ? newWishes : [...this.data.wishesList, ...newWishes]
      this.setData({
        wishesList: wishesList,
        wishesPageNo: this.data.wishesPageNo + 1,
        wishesHasMore: newWishes.length >= 10,
        loading: false
      })
    }).catch(err => {
      console.error('加载心愿收藏失败', err)
      this.setData({ loading: false })
    })
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    if (tab === 'wishes' && this.data.wishesList.length === 0) {
      this.loadWishesCollection()
    }
  },

  removeFavorite: function(e) {
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          collectionAPI.removeCollection(id, type).then(() => {
            if (type === 'items') {
              const updatedList = this.data.itemsList.filter(item => item.id !== id)
              this.setData({ itemsList: updatedList })
            } else if (type === 'wishes') {
              const updatedList = this.data.wishesList.filter(item => item.id !== id)
              this.setData({ wishesList: updatedList })
            }
            wx.showToast({ title: '取消成功', icon: 'success' })
          }).catch(err => {
            console.error('取消收藏失败', err)
            wx.showToast({ title: '取消失败', icon: 'error' })
          })
        }
      }
    })
  },

  navigateToItemDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?id=${id}`
    })
  },

  navigateToWishDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/wish-detail/wish-detail?id=${id}`
    })
  },

  onReachBottom: function() {
    if (this.data.loading) return
    if (this.data.activeTab === 'items') {
      if (this.data.itemsHasMore) this.loadItemsCollection()
    } else {
      if (this.data.wishesHasMore) this.loadWishesCollection()
    }
  }
})