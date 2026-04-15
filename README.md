# 同城二手物品交易平台 - 微信小程序版

## 项目简介

这是一个原生微信小程序项目，用于同城二手物品交易。用户可以发布、浏览、搜索二手物品，支持人民币交易和以物换物两种方式。

## 项目结构

```
city-secondhand-weapp/
├── pages/                    # 页面文件
│   ├── home/                 # 首页
│   ├── publish/              # 发布页面
│   ├── item-detail/          # 物品详情页
│   ├── login/                # 登录页面
│   ├── search/               # 搜索页面
│   ├── wish-wall/            # 求换墙
│   ├── profile/              # 个人资料
│   └── messages/             # 消息页面
├── components/               # 可复用组件
│   ├── item-card/            # 物品卡片组件
│   ├── search-bar/           # 搜索栏组件
│   ├── location-picker/      # 位置选择器
│   ├── image-uploader/       # 图片上传器
│   └── tab-bar/              # 底部导航栏
├── utils/                    # 工具函数
│   ├── api.js                # API 请求工具
│   └── helpers.js            # 辅助函数
├── styles/                   # 全局样式
├── images/                   # 图片资源
├── app.js                    # 应用入口
├── app.json                  # 应用配置
├── app.wxss                  # 全局样式
└── project.config.json       # 项目配置
```

## 快速开始

### 1. 获取 AppID

访问 [微信公众平台](https://mp.weixin.qq.com)，注册小程序账号并获取 AppID。

### 2. 配置项目

编辑 `project.config.json`，将 `YOUR_APP_ID` 替换为你的 AppID：

```json
{
  "appid": "YOUR_APP_ID",
  ...
}
```

### 3. 安装微信开发者工具

下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 4. 打开项目

在微信开发者工具中打开此项目目录。

### 5. 配置 API 地址

编辑 `app.js`，将 `baseUrl` 替换为你的 API 服务器地址：

```javascript
globalData: {
  baseUrl: 'https://your-api-server.com'
}
```

### 6. 配置业务域名

在 [微信公众平台](https://mp.weixin.qq.com) 的小程序后台：
- 进入 **开发** → **开发设置**
- 配置 **服务器域名**：添加你的 API 服务器域名

## 核心功能

### 已实现
- ✅ 首页物品列表展示
- ✅ 物品搜索和筛选
- ✅ 基础页面框架

### 待实现（第二阶段）
- 🔄 物品发布功能
- 🔄 物品详情页
- 🔄 用户登录和认证
- 🔄 消息和聊天
- 🔄 求换墙功能
- 🔄 个人资料管理

## API 接口

### 物品相关
- `GET /api/items` - 获取物品列表
- `GET /api/items/:id` - 获取物品详情
- `POST /api/items` - 发布物品
- `PUT /api/items/:id` - 更新物品
- `DELETE /api/items/:id` - 删除物品
- `GET /api/items/search` - 搜索物品

### 用户相关
- `POST /api/auth/login` - 登录
- `POST /api/auth/wechat-login` - 微信登录
- `GET /api/users/me` - 获取用户信息
- `PUT /api/users/me` - 更新用户信息

### 消息相关
- `GET /api/messages` - 获取消息列表
- `POST /api/messages` - 发送消息
- `GET /api/messages/:id` - 获取消息详情

### 求换墙
- `GET /api/wishes` - 获取求换列表
- `POST /api/wishes` - 发布求换
- `GET /api/wishes/:id` - 获取求换详情
- `DELETE /api/wishes/:id` - 删除求换

## 开发指南

### 添加新页面

1. 在 `pages` 目录下创建新文件夹
2. 创建 `.wxml`、`.js`、`.wxss` 文件
3. 在 `app.json` 中的 `pages` 数组中添加页面路径

### 添加新组件

1. 在 `components` 目录下创建新文件夹
2. 创建组件文件（`.wxml`、`.js`、`.wxss`）
3. 在页面中引入并使用

### 调用 API

```javascript
const { itemAPI } = require('../../utils/api')

// 获取物品列表
itemAPI.getItems({ page: 1, pageSize: 10 })
  .then(res => {
    console.log('物品列表:', res)
  })
  .catch(err => {
    console.error('获取失败:', err)
  })
```

## 样式规范

- 使用 `rpx` 作为单位（响应式像素）
- 颜色变量定义在 `app.wxss` 中
- 组件样式独立在各自的 `.wxss` 文件中

## 性能优化

- 使用图片懒加载：`lazy-load="true"`
- 分页加载数据，避免一次性加载过多
- 使用 `wx:if` 和 `wx:show` 合理控制 DOM
- 及时清理定时器和事件监听

## 常见问题

### Q: 如何处理图片上传？
A: 使用 `wx.chooseImage()` 选择图片，然后用 `wx.uploadFile()` 上传。

### Q: 如何获取用户位置？
A: 使用 `wx.getLocation()` 获取用户当前位置，需要用户授权。

### Q: 如何实现消息推送？
A: 使用微信小程序的模板消息或订阅消息功能。

### Q: 如何处理支付？
A: 使用 `wx.requestPayment()` 调起微信支付。

## 部署上线

1. 在微信开发者工具中上传代码
2. 在微信公众平台后台提交审核
3. 等待审核通过后发布

## 技术栈

- **框架**：原生微信小程序
- **语言**：JavaScript
- **样式**：WXSS
- **模板**：WXML

## 许可证

MIT

## 联系方式

如有问题或建议，请联系开发团队。

---

**最后更新**：2024年1月
