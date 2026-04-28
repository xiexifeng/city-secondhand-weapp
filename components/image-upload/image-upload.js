const { fileAPI } = require('../../utils/api');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    images: {
      type: Array,
      value: []
    },
    maxCount: {
      type: Number,
      value: 9
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 选择图片
     */
    handleAdd: function() {
      const { images, maxCount } = this.data;
      if (images.length >= maxCount) {
        wx.showToast({
          title: `最多上传${maxCount}张图片`,
          icon: 'none'
        });
        return;
      }

      wx.chooseImage({
        count: maxCount - images.length,
        sizeType: ['compressed'], // 只选择压缩后的图片
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 立即上传选中的图片
          this.uploadImages(res.tempFilePaths);
        }
      });
    },

    /**
     * 上传图片到服务器
     */
    uploadImages: async function(tempFilePaths) {
      const { images } = this.data;
      const uploadedImages = [...images];

      for (const tempFilePath of tempFilePaths) {
        try {
          // 显示上传中提示
          wx.showLoading({
            title: '上传中...',
            mask: true
          });

          // 上传图片
          const uploadResult = await fileAPI.uploadImage(tempFilePath);
          uploadedImages.push(uploadResult.data.fileUrl);

          // 更新图片列表
          this.setData({
            images: uploadedImages
          });

          // 触发图片更新事件
          this.triggerEvent('change', { images: uploadedImages });
        } catch (error) {
          console.error('图片上传失败:', error);
          // 上传失败，提示用户
          wx.showToast({
            title: '图片上传失败，请重试',
            icon: 'none'
          });
          // 移除失败的图片（这里只是不添加到列表）
        } finally {
          // 隐藏加载提示
          wx.hideLoading();
        }
      }
    },

    /**
     * 删除图片
     */
    handleDelete: function(e) {
      const index = e.currentTarget.dataset.index;
      const { images } = this.data;
      const newImages = [...images];
      newImages.splice(index, 1);

      this.setData({
        images: newImages
      });

      // 触发图片更新事件
      this.triggerEvent('change', { images: newImages });
    }
  }
})