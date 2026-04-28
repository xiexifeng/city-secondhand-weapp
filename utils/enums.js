// utils/enums.js

/**
 * 物品状态枚举
 */
export const ITEM_STATUS = {
  AUDITING: 'auditing',     // 审核中
  ACTIVE: 'active',         // 有效
  INACTIVE: 'inactive'      // 无效
};

/**
 * 心愿状态枚举
 */
export const WISH_STATUS = {
  AUDITING: 'auditing',     // 审核中
  ACTIVE: 'active',         // 有效（审核通过，展示中）
  INACTIVE: 'inactive',     // 无效（审核不通过）
  TIMEOUT: 'timeout',       // 失效（超时）
  ACHIEVED: 'achieved',     // 心愿达成
  CANCELLED: 'cancelled'    // 撤回心愿
};

/**
 * 物品转让状态枚举
 */
export const TRANSFER_STATUS = {
  OWN: 'own',                     // 未发布
  TRANSFERRING: 'transferring',   // 发布中
  TRANSFER_ACCEPTED: 'transfer_accepted',  // 已接受
  TRANSFERRED: 'transferred',     // 已转让
  TRANSFER_CANCELLED: 'transfer_cancelled' // 已取消
};


/**
 * 转让状态显示文本映射
 */
export const TRANSFER_STATUS_LABELS = {
  [TRANSFER_STATUS.OWN]: '待发布',
  [TRANSFER_STATUS.TRANSFERRING]: '发布中',
  [TRANSFER_STATUS.TRANSFER_ACCEPTED]: '已接受',
  [TRANSFER_STATUS.TRANSFERRED]: '已转让',
  [TRANSFER_STATUS.TRANSFER_CANCELLED]: '已取消'
};

/**
 * 审核状态显示文本映射
 */
export const REVIEW_STATUS_LABELS = {
  [ITEM_STATUS.AUDITING]: '待审核',
  [ITEM_STATUS.ACTIVE]: '已通过',
  [ITEM_STATUS.INACTIVE]: '审核不通过'
};

/**
 * 心愿状态显示文本映射
 */
export const WISH_STATUS_LABELS = {
  [WISH_STATUS.AUDITING]: '待审核',
  [WISH_STATUS.ACTIVE]: '进行中',
  [WISH_STATUS.INACTIVE]: '审核不通过',
  [WISH_STATUS.TIMEOUT]: '已失效',
  [WISH_STATUS.ACHIEVED]: '已达成',
  [WISH_STATUS.CANCELLED]: '已撤回'
};

/**
 * 获取物品状态显示文本
 * @param {string} transferStatus - 转让状态
 * @returns {string} 状态显示文本
 */
export function getTransferStatusLabel(transferStatus) {

  return TRANSFER_STATUS_LABELS[transferStatus] || '';
}

/**
 * 获取审核状态显示文本
 * @param {string} status - 物品状态
 * @returns {string} 审核状态显示文本
 */
export function getReviewStatusLabel(status) {
  return REVIEW_STATUS_LABELS[status] || '';
}

/**
 * 获取转让状态对应的CSS类名
 * @param {string} transferStatus - 状态显示文本
 * @returns {string} CSS类名
 */
export function getTransferStatusClass(transferStatus) {
  const classMap = {
    [TRANSFER_STATUS.OWN]: 'status-pending-transfer',
    [TRANSFER_STATUS.TRANSFERRING]: 'status-transferring',  
    [TRANSFER_STATUS.TRANSFER_ACCEPTED]: 'status-accepted',
    [TRANSFER_STATUS.TRANSFERRED]: 'status-transferred',
    [TRANSFER_STATUS.TRANSFER_CANCELLED]: 'status-cancelled',
  };
  return classMap[transferStatus] || 'status-pending-transfer';
}

/**
 * 获取审核状态对应的CSS类名
 * @param {string} reviewStatus - 审核状态
 * @returns {string} CSS类名
 */
export function getReviewStatusClass(reviewStatus) {
  const classMap = {
    [ITEM_STATUS.AUDITING]: 'review-pending',
    [ITEM_STATUS.ACTIVE]: 'review-approved',
    [ITEM_STATUS.INACTIVE]: 'review-rejected' 
  };
  return classMap[reviewStatus] || 'review-pending';
}

/**
 * 获取心愿状态显示文本
 * @param {string} status - 心愿状态
 * @returns {string} 状态显示文本
 */
export function getWishStatusLabel(status) {
  return WISH_STATUS_LABELS[status] || '';
}

/**
 * 获取心愿状态对应的CSS类名
 * @param {string} status - 心愿状态
 * @returns {string} CSS类名
 */
export function getWishStatusClass(status) {
  const classMap = {
    [WISH_STATUS.AUDITING]: 'wish-pending',
    [WISH_STATUS.ACTIVE]: 'wish-active',
    [WISH_STATUS.INACTIVE]: 'wish-rejected',
    [WISH_STATUS.TIMEOUT]: 'wish-timeout',
    [WISH_STATUS.ACHIEVED]: 'wish-achieved',
    [WISH_STATUS.CANCELLED]: 'wish-cancelled'
  };
  return classMap[status] || 'wish-pending';
}
