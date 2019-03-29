// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import FlagIcon from 'vue-flag-icon';

// import the stylesheet from the vuetify package.
import('../node_modules/vuetify/dist/vuetify.min.css');

//? Do we need this?
var storageOptions = {
  namespace: 'user_', // key prefix
  name: 'ls', // name variable Vue.[ls] or this.[$ls],
  storage: 'local', // storage name session, local, memory
};

Vue.use(FlagIcon);
Vue.use(VueAxios, axios);
Vue.use(Vuetify, {
  theme: {
    primary: '#79589F',
    secondary: '#CBCBD2',
    success: '#74C080',
    error: '#D64242'
  }
});
Vue.config.productionTip = false;

/* eslint-disable no-new */
// wait 1 second before rendering vue to avoid flicker
setTimeout(() => {
  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  })
}, 1000);