// 配置文件

// 腾讯地图API Key
export const TENCENT_MAP_KEY = 'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77';

// 物品分类
export const CATEGORIES = [
  '数码3C',
  '服饰鞋包',
  '家居生活',
  '母婴用品',
  '书籍文具',
  '美妆个护',
  '运动户外',
  '其他'
];

// 物品成色
export const CONDITIONS = [
  '全新',
  '9.5成新',
  '9成新',
  '8.5成新',
  '8成新',
  '7成新',
  '6成新',
  '5成新',
  '以下'
];

// 物品标签
export const TAGS = [
  { name: '全新未拆封', selected: false },
  { name: '国行版本', selected: false },
  { name: '原装配件', selected: false },
  { name: '保修期内', selected: false },
  { name: '无划痕', selected: false },
  { name: '当面交易', selected: false },
  { name: '可小刀', selected: false },
  { name: '包邮', selected: false }
];

// 表单字段字数限制
export const MAX_LENGTHS = {
  title: 30,
  description: 500,
  price: 10,
  wantItems: 50,
  budget: 100,
  wechat: 20,
  phone: 11
};

// 物品成色到折旧值的映射
export const CONDITION_MAP = {
  '全新': 10,
  '9.5成新': 9,
  '9成新': 8,
  '8.5成新': 7,
  '8成新': 6,
  '7成新': 5,
  '6成新': 4,
  '5成新': 3,
  '以下': 2
};
