# 城市二手小程序 - 公共API规范

## 目录

1. [统一返回结构](#统一返回结构)
2. [App全局方法](#app全局方法)
3. [工具函数](#工具函数)
4. [API模块](#api模块)
5. [枚举定义](#枚举定义)
6. [配置常量](#配置常量)
7. [公共组件](#公共组件)
8. [分页请求规范](#分页请求规范)
9. [地点处理](#地点处理)

---

## 统一返回结构

后端API统一返回格式：

```javascript
{
  "success": true,      // 是否成功
  "code": "000000",     // 状态码
  "desc": "请求成功",    // 描述信息
  "data": {}            // 数据（可为null、JSON对象、数组、字符串）
}
```

**响应处理逻辑**（app.js:74-83）：
- 若 `success === true` 且 `data` 存在，直接返回 `data`
- 否则返回完整响应对象
- 401未授权时自动清除登录状态并跳转登录页

---

## App全局方法

### 获取App实例

```javascript
const app = getApp()
```

### 全局数据

| 属性 | 类型 | 说明 |
|------|------|------|
| `userInfo` | Object | 用户信息 |
| `token` | String | 登录令牌 |
| `userPhone` | String | 用户手机号 |
| `baseUrl` | String | 后端服务地址 |
| `editItemId` | String | 编辑物品ID |
| `editWishId` | String | 编辑心愿ID |
| `latitude` | Number | 全局纬度（缓存） |
| `longitude` | Number | 全局经度（缓存） |

### 方法列表

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `checkLogin()` | 无 | 无 | 检查登录状态 |
| `getUserInfo(callback)` | callback: Function | 无 | 获取用户信息 |
| `request(options)` | options: Object | Promise | 发起API请求 |
| `showLoading(title)` | title: String | 无 | 显示加载提示 |
| `hideLoading()` | 无 | 无 | 隐藏加载提示 |
| `showToast(title, icon, duration)` | title: String, icon: String, duration: Number | 无 | 显示提示信息 |
| `getLocation()` | 无 | Promise | 获取定位（优先缓存，无缓存则请求授权） |
| `updateLocation()` | 无 | Promise | 强制刷新定位（不使用缓存） |
| `clearLocation()` | 无 | void | 清除定位缓存 |

### request方法参数

```javascript
{
  url: String,        // 请求地址（支持完整URL或相对路径）
  method: String,     // 请求方法（GET/POST，默认GET）
  data: Object,       // 请求数据
  header: Object      // 请求头
}
```

---

## 工具函数

### 格式化工具

**utils/helpers.js**:

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `formatPrice(price)` | price: Number/String | String | 格式化价格，返回 ¥XX.XX |
| `formatDate(timestamp, format)` | timestamp: Number, format: String | String | 格式化日期，默认 YYYY-MM-DD HH:mm |
| `formatDistance(meters)` | meters: Number | String | 格式化距离，小于1km显示m，否则显示km |
| `formatRelativeTime(timestamp)` | timestamp: Number | String | 相对时间（刚刚/XX分钟前/XX小时前/XX天前） |

**utils/format.js**（ES Module导出）:

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `formatDate(timestamp, format)` | timestamp: Number/String, format: String | String | 格式化日期 |
| `formatPrice(price, currency)` | price: Number/String, currency: String | String | 格式化价格 |
| `formatNumber(num)` | num: Number/String | String | 添加千分位 |
| `formatFileSize(bytes)` | bytes: Number | String | 格式化文件大小 |
| `formatDistance(distance)` | distance: Number | Object | 返回 { text, type } |
| `formatRelativeTime(timestamp)` | timestamp: Number/String | String | 相对时间 |

### 验证工具

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `isValidPhone(phone)` | phone: String | Boolean | 验证手机号 |
| `isValidEmail(email)` | email: String | Boolean | 验证邮箱 |
| `isValidIdCard(idCard)` | idCard: String | Boolean | 验证身份证号 |

### 通用工具

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `debounce(func, wait)` | func: Function, wait: Number | Function | 防抖函数 |
| `throttle(func, limit)` | func: Function, limit: Number | Function | 节流函数 |
| `deepClone(obj)` | obj: Any | Any | 深拷贝 |
| `getQueryParam(url, param)` | url: String, param: String | String | 获取URL参数 |
| `generateUUID()` | 无 | String | 生成UUID |
| `checkPermission(permission)` | permission: String | Promise | 检查权限 |
| `requestPermission(permission)` | permission: String | Promise | 请求权限 |

---

## API模块

### 导入方式

```javascript
const { itemAPI, userAPI, wishAPI, wishWallAPI, socialAPI, fileAPI } = require('./utils/api')
```

### wishWallAPI - 心愿墙

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `getWishes(params)` | params: Object | 获取心愿列表 |
| `getWishDetail(wishId, params)` | wishId: String, params: Object | 获取心愿详情 |
| `socialWish(wishId, socialType, socialOperate)` | wishId: String, socialType: String, socialOperate: String | 社交操作 |
| `likeWish(wishId)` | wishId: String | 点赞心愿 |
| `unlikeWish(wishId)` | wishId: String | 取消点赞 |
| `collectWish(wishId)` | wishId: String | 收藏心愿 |
| `uncollectWish(wishId)` | wishId: String | 取消收藏 |

### itemAPI - 物品

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `getItems(params)` | params: Object | 获取物品列表 |
| `getItemDetail(itemId, latitude, longitude)` | itemId: String, latitude: Number, longitude: Number | 获取物品详情 |
| `publishItem(data)` | data: Object | 发布物品 |
| `updateItem(itemId, data)` | itemId: String, data: Object | 更新物品 |
| `deleteItem(itemId)` | itemId: String | 删除物品 |
| `getMyItems(params)` | params: Object | 获取我的物品列表 |
| `updateTransferStatus(itemId, transferStatus)` | itemId: String, transferStatus: String | 更新转让状态 |
| `getMyItemDetail(itemId)` | itemId: String | 获取我的物品详情 |

### userAPI - 用户

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `sendSms(phoneNumbers)` | phoneNumbers: String | 发送验证码 |
| `loginOrRegister(phoneNumbers, verifyCode)` | phoneNumbers: String, verifyCode: String | 登录/注册 |
| `loginByPassword(phoneNumbers, password)` | phoneNumbers: String, password: String | 密码登录 |
| `getUserInfo()` | 无 | 获取用户信息 |
| `updateUserInfo(data)` | data: Object | 更新用户信息 |
| `getUserItems(userId)` | userId: String | 获取用户物品列表 |

### wishAPI - 求换（我的求换）

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `getMyWishes(params)` | params: Object | 获取我的求换列表 |
| `publishWish(data)` | data: Object | 发布求换 |
| `updateWish(wishId, data)` | wishId: String, data: Object | 更新求换 |
| `getMyWishDetail(wishId)` | wishId: String | 获取我的求换详情 |
| `deleteWish(wishId)` | wishId: String | 删除求换 |
| `updateWishStatus(wishId, status)` | wishId: String, status: String | 更新求换状态 |

### socialAPI - 社交

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `socialItem(itemId, socialType, socialOperate)` | itemId: String, socialType: String, socialOperate: String | 物品社交操作 |

### fileAPI - 文件上传

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `uploadImage(filePath)` | filePath: String | 上传图片 |

---

## 枚举定义

### ITEM_STATUS - 物品状态

| 枚举值 | 说明 |
|--------|------|
| `AUDITING` | 审核中 |
| `ACTIVE` | 有效 |
| `INACTIVE` | 无效 |

### WISH_STATUS - 心愿状态

| 枚举值 | 说明 |
|--------|------|
| `AUDITING` | 审核中 |
| `ACTIVE` | 有效（审核通过，展示中） |
| `INACTIVE` | 无效（审核不通过） |
| `TIMEOUT` | 失效（超时） |
| `ACHIEVED` | 心愿达成 |
| `CANCELLED` | 撤回心愿 |

### TRANSFER_STATUS - 转让状态

| 枚举值 | 说明 |
|--------|------|
| `OWN` | 未发布 |
| `TRANSFERRING` | 发布中 |
| `TRANSFER_ACCEPTED` | 已接受 |
| `TRANSFERRED` | 已转让 |
| `TRANSFER_CANCELLED` | 已取消 |

### 状态标签映射

| 映射对象 | 说明 |
|----------|------|
| `TRANSFER_STATUS_LABELS` | 转让状态显示文本 |
| `REVIEW_STATUS_LABELS` | 审核状态显示文本 |
| `WISH_STATUS_LABELS` | 心愿状态显示文本 |

### 状态CSS类映射

| 函数名 | 返回值 | 说明 |
|--------|--------|------|
| `getTransferStatusClass(status)` | String | 转让状态CSS类 |
| `getReviewStatusClass(status)` | String | 审核状态CSS类 |
| `getWishStatusClass(status)` | String | 心愿状态CSS类 |

---

## 配置常量

### 地图配置

```javascript
TENCENT_MAP_KEY = 'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77'
```

### 物品分类

```javascript
CATEGORIES = ['数码3C', '服饰鞋包', '家居生活', '母婴用品', '书籍文具', '美妆个护', '运动户外', '其他']
```

### 物品成色

```javascript
CONDITIONS = ['全新', '9.5成新', '9成新', '8.5成新', '8成新', '7成新', '6成新', '5成新', '以下']
```

### 物品标签

```javascript
TAGS = [
  { name: '全新未拆封', selected: false },
  { name: '国行版本', selected: false },
  { name: '原装配件', selected: false },
  { name: '保修期内', selected: false },
  { name: '无划痕', selected: false },
  { name: '当面交易', selected: false },
  { name: '可小刀', selected: false },
  { name: '包邮', selected: false }
]
```

### 表单字数限制

| 字段 | 最大长度 |
|------|----------|
| title | 30 |
| description | 500 |
| price | 10 |
| wantItems | 50 |
| budget | 100 |
| wechat | 20 |
| phone | 11 |

### 成色折旧映射

```javascript
CONDITION_MAP = {
  '全新': 10,
  '9.5成新': 9,
  '9成新': 8,
  '8.5成新': 7,
  '8成新': 6,
  '7成新': 5,
  '6成新': 4,
  '5成新': 3,
  '以下': 2
}
```

---

## 公共组件

### image-upload - 图片上传组件

**属性**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| images | Array | [] | 已上传图片列表 |
| maxCount | Number | 9 | 最大上传数量 |

**事件**：

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | { images } | 图片列表变化时触发 |

**使用示例**：

```wxml
<image-upload 
  images="{{images}}" 
  max-count="9" 
  bind:change="onImagesChange"
/>
```

### report-form - 举报表单组件

**属性**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| item | Object | {} | 被举报物品信息 |

**事件**：

| 事件名 | 参数 | 说明 |
|--------|------|------|
| close | 无 | 关闭时触发 |

**举报原因**：

| ID | 标题 | 描述 |
|----|------|------|
| 1 | 虚假物品 | 物品不存在或与描述严重不符 |
| 2 | 信息误导 | 物品描述虚假或图片与实物不符 |
| 3 | 违禁物品 | 发布法律法规禁止的物品 |
| 4 | 侵权行为 | 侵犯他人知识产权或肖像权 |
| 5 | 垃圾广告 | 发布与二手交易无关的广告信息 |
| 6 | 其他原因 | 其他违反平台规定的行为 |

---

## 分页请求规范

### 请求参数

```javascript
{
  pageNo: Number,      // 页码，从1开始
  pageSize: Number,     // 每页条数，默认10
  // 其他业务参数...
}
```

### 响应结构

```javascript
{
  success: true,
  code: "000000",
  desc: "请求成功",
  data: [{},{}]
}
```

### 使用示例

```javascript
async loadItems() {
  const params = {
    pageNo: this.data.pageNo,
    pageSize: 10,
    category: this.data.category
  }
  const result = await itemAPI.getItems(params)
  this.setData({
    items: [...this.data],
    pageNo: result.pageNo + 1
  })
}
```

---

## 地点处理

### 坐标参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| latitude | Number | 纬度 |
| longitude | Number | 经度 |

### 全局定位管理

#### 全局坐标存储

```javascript
// app.js globalData
{
  latitude: null,      // 全局纬度
  longitude: null      // 全局经度
}
```

#### 获取定位（带内存缓存）

优先使用内存缓存，无缓存时自动请求授权并获取定位：

```javascript
const app = getApp()

async function loadLocation() {
  try {
    const { latitude, longitude } = await app.getLocation()
    // 使用坐标
    console.log(`当前位置: ${latitude}, ${longitude}`)
  } catch (error) {
    console.error('获取定位失败:', error.message)
    // 定位失败处理
  }
}
```

#### 小程序启动时静默刷新

小程序启动时（`onLaunch`）会自动静默刷新定位（如果已授权）：

```
小程序冷启动
      │
      ▼
onLaunch() 调用 silentRefreshLocation()
      │
      ▼
 检查定位权限
      │
   ┌──┴──┐
   │ 是  │ 否
   ▼     ▼
静默获取定位  不做任何操作
更新内存缓存
```

**静默刷新特点**：
- 只在已授权时执行，不会弹出授权弹窗
- 失败时不提示用户，不影响小程序启动
- 保证重启后定位是最新的（如果有权限）

#### 定位方法列表

| 方法名 | 返回值 | 说明 |
|--------|--------|------|
| `getLocation()` | Promise | 获取定位（优先使用内存缓存） |
| `updateLocation()` | Promise | 强制刷新定位（清除缓存后重新获取） |
| `clearLocation()` | void | 清除定位缓存 |

#### 定位授权流程

```
调用 getLocation()
        │
        ▼
   检查全局缓存
        │
   ┌────┴────┐
   │ 有缓存  │ 无缓存
   ▼         ▼
返回缓存    检查权限
              │
      ┌───────┴───────┐
      │ 有权限        │ 无权限
      ▼               ▼
   获取定位      弹窗请求授权
                   │
          ┌────────┴────────┐
          │ 去设置          │ 取消
          ▼                 ▼
       打开设置        reject(error)
          │
          ▼
     用户授权后
     获取定位
```

#### 缓存生命周期

| 场景 | 缓存状态 |
|------|----------|
| 小程序运行期间 | 缓存有效，页面间共享 |
| 页面跳转 | 缓存保持不变 |
| 小程序切换后台 | 缓存保留（内存未释放） |
| 小程序被系统销毁 | 缓存失效（内存释放） |
| 小程序重启（冷启动） | 缓存重新初始化（静默刷新会重新获取） |

**换城市场景处理**：
- 用户关闭小程序去其他城市，重新打开时会自动静默刷新获取新定位（如果已授权）
- 未授权时，首次调用 `getLocation()` 会请求授权

### 距离计算

使用 `formatDistance` 工具函数：

```javascript
// helpers.js - 输入米
formatDistance(500)    // "500m"
formatDistance(1500)   // "1.5km"

// format.js - 输入千米
formatDistance(0.5)    // { text: "500m", type: "near" }
formatDistance(100)    // { text: "非同城", type: "remote" }
```

---

## 错误处理规范

### 网络错误

```javascript
try {
  const result = await api.request()
} catch (error) {
  wx.showToast({
    title: error.message || '请求失败',
    icon: 'none'
  })
}
```

### 401未授权

框架自动处理，跳转登录页（app.js:84-90）

### 业务错误

```javascript
const response = await app.request({ url: '/api/xxx' })
if (!response.success) {
  wx.showToast({
    title: response.desc || '操作失败',
    icon: 'none'
  })
  return
}
```

---

## 存储规范

### 登录信息存储

```javascript
// 设置
wx.setStorageSync('token', token)
wx.setStorageSync('userInfo', userInfo)
wx.setStorageSync('userPhone', phone)

// 获取
wx.getStorageSync('token')
wx.getStorageSync('userInfo')
wx.getStorageSync('userPhone')

// 清除
wx.removeStorageSync('token')
wx.removeStorageSync('userInfo')
```

---

**文档版本**: v1.0  
**生成时间**: 2026-04-30  
**适用项目**: city-secondhand-weapp