// utils/api.js
const app = getApp()

// 心愿墙相关 API
const wishWallAPI = {
  getWishes(params) {
    return app.request({
      url: '/client/wish-wall/list-wish',
      method: 'POST',
      data: params
    })
  },

  getWishDetail(wishId, params) {
    let url = `/client/wish-wall/detail-wish/${wishId}`;
    if (params && params.latitude && params.longitude) {
      url += `?latitude=${params.latitude}&longitude=${params.longitude}`;
    }
    return app.request({
      url: url,
      method: 'GET'
    })
  },

  socialWish(wishId, socialType, socialOperate) {
    let url = `/client/wish-wall/social-wish/${wishId}`;
    url += `?socialType=${socialType}&socialOperate=${socialOperate}`;
    return app.request({
      url: url,
      method: 'POST'
    })
  },

  likeWish(wishId) {
    return this.socialWish(wishId, 'LOVE', 'ADD')
  },

  unlikeWish(wishId) {
    return this.socialWish(wishId, 'LOVE', 'CANCEL')
  },

  collectWish(wishId) {
    return this.socialWish(wishId, 'COLLECTION', 'ADD')
  },

  uncollectWish(wishId) {
    return this.socialWish(wishId, 'COLLECTION', 'CANCEL')
  }
}

// 物品相关 API
const itemAPI = {
  getItems(params) {
    return app.request({
      url: '/client/square/list-item',
      method: 'POST',
      data: params
    })
  },

  getItemDetail(itemId, latitude, longitude) {
    let url = `/client/square/detail-item/${itemId}`;
    if (latitude && longitude) {
      url += `?latitude=${latitude}&longitude=${longitude}`;
    }
    return app.request({
      url: url,
      method: 'POST'
    })
  },

  publishItem(data) {
    return app.request({
      url: '/client/item/publish',
      method: 'POST',
      data: data
    })
  },

  updateItem(itemId, data) {
    return app.request({
      url: `/client/item/update/${itemId}`,
      method: 'POST',
      data: data
    })
  },

  deleteItem(itemId) {
    return app.request({
      url: `/client/item/delete/${itemId}`,
      method: 'POST'
    })
  },

  getMyItems(params) {
    return app.request({
      url: '/client/item/list-mine',
      method: 'POST',
      data: params
    })
  },

  updateTransferStatus(itemId, transferStatus) {
    return app.request({
      url: '/client/item/transfer-status',
      method: 'POST',
      data: { itemId, transferStatus }
    })
  },

  getMyItemDetail(itemId) {
    return app.request({
      url: `/client/item/detail/${itemId}`,
      method: 'POST'
    })
  }
}

// 用户相关 API
const userAPI = {
  sendSms(phoneNumbers) {
    return app.request({
      url: '/client/auth/send-sms?phoneNumbers=' + phoneNumbers,
      method: 'POST'
    })
  },

  loginOrRegister(phoneNumbers, verifyCode) {
    return app.request({
      url: '/client/auth/login-or-register?phoneNumbers=' + phoneNumbers + '&verifyCode=' + verifyCode,
      method: 'POST'
    })
  },

  loginByPassword(phoneNumbers, password) {
    return app.request({
      url: '/client/auth/login-by-password?phoneNumbers=' + phoneNumbers + '&password=' + password,
      method: 'POST'
    })
  },

  getUserInfo() {
    return app.request({
      url: '/client/user/get',
      method: 'GET'
    })
  },

  updateUserInfo(data) {
    return app.request({
      url: '/client/user/update',
      method: 'POST',
      data: data
    })
  },

  getUserItems(userId) {
    return app.request({
      url: `/client/item/my-list`,
      method: 'GET'
    })
  }
}

// 消息相关 API
const messageAPI = {
  getMessages(params) {
    return app.request({
      url: '/client/notification/list-mine',
      method: 'POST',
      data: params
    })
  },

  readMessage(messageId) {
    return app.request({
      url: `/client/notification/read/${messageId}`,
      method: 'GET'
    })
  },

  deleteMessage(messageId) {
    return app.request({
      url: `/client/notification/${messageId}`,
      method: 'DELETE'
    })
  }
}

// 举报相关 API
const reportAPI = {
  getReportDetail(reportId) {
    return app.request({
      url: `/client/report/${reportId}`,
      method: 'GET'
    })
  },

  handleReport(reportId, status, remark) {
    return app.request({
      url: `/client/report/${reportId}/handle`,
      method: 'POST',
      data: {
        status: status,
        reviewerNote: remark
      }
    })
  },

  submitReport(reportType, relatedId, reason, description, images) {
    return app.request({
      url: '/client/report',
      method: 'POST',
      data: {
        reportType: reportType,
        relatedId: relatedId,
        reportReason: reason,
        description: description,
        images: images || []
      }
    })
  }
}

// 求换相关 API（我的求换）
const wishAPI = {
  getMyWishes(params) {
    return app.request({
      url: '/client/wish/list-mine',
      method: 'POST',
      data: params
    })
  },

  publishWish(data) {
    return app.request({
      url: '/client/wish/publish',
      method: 'POST',
      data: data
    })
  },

  updateWish(wishId, data) {
    return app.request({
      url: `/client/wish/update/${wishId}`,
      method: 'POST',
      data: data
    })
  },

  getMyWishDetail(wishId) {
    return app.request({
      url: `/client/wish/detail/${wishId}`,
      method: 'POST'
    })
  },

  deleteWish(wishId) {
    return app.request({
      url: `/client/wish/delete/${wishId}`,
      method: 'POST'
    })
  },

  updateWishStatus(wishId, status) {
    return app.request({
      url: `/client/wish/status/${wishId}?status=${status}`,
      method: 'POST'
    })
  }
}

// 社交相关 API
const socialAPI = {
  socialItem(itemId, socialType, socialOperate) {
    let url = `/client/square/social-item/${itemId}`;
    url += `?socialType=${socialType}&socialOperate=${socialOperate}`;
    return app.request({
      url: url,
      method: 'POST'
    })
  }
}

// 文件上传相关
const fileAPI = {
  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')

      wx.uploadFile({
        url: app.globalData.baseUrl + '/basic/oss/uploadFile',
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            if (data.success) {
              resolve({ data: { fileUrl: data.data } });
            } else {
              reject({ message: data.desc || '上传失败' });
            }
          } else {
            reject({ message: '上传失败', error: res.data });
          }
        },
        fail: (err) => {
          reject({ message: '上传失败', error: err })
        }
      })
    })
  }
}

// 审核相关 API
const auditAPI = {
  getAuditList(params) {
    return app.request({
      url: '/client/audit/list',
      method: 'GET',
      data: params
    })
  },

  getAuditDetail(taskId) {
    return app.request({
      url: `/client/audit/${taskId}`,
      method: 'GET'
    })
  },

  submitAuditResult(taskId, relatedId, result, remark) {
    return app.request({
      url: '/client/audit',
      method: 'POST',
      data: {
        taskId: taskId,
        relatedId: relatedId,
        result: result,
        auditRemark: remark
      }
    })
  }
}


module.exports = {
  itemAPI,
  userAPI,
  messageAPI,
  wishAPI,
  wishWallAPI,
  socialAPI,
  fileAPI,
  auditAPI,
  reportAPI
}