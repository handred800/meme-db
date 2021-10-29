import Vue from 'vue'
import App from './App.vue'
import VoerroTagsInput from '@voerro/vue-tagsinput';
import { VueMasonryPlugin } from 'vue-masonry';
import './assets/main.scss'
import router from './router'

Vue.component('tags-input', VoerroTagsInput);
Vue.use(VueMasonryPlugin)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
