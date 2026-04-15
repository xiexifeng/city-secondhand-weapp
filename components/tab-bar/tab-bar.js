// components/tab-bar/tab-bar.js

Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home'
    }
  },

  methods: {
    handleTabClick: function(e) {
      const tab = e.currentTarget.dataset.tab;
      
      // 路由映射
      const routes = {
        'home': '/pages/home/home',
        'wish': '/pages/wish-wall/wish-wall',
        'publish': '/pages/publish/publish',
        'message': '/pages/messages/messages',
        'profile': '/pages/profile/profile'
      };
      
      if (routes[tab]) {
        wx.switchTab({
          url: routes[tab]
        });
      }
    }
  }
});
