import Vue from 'vue'
import App from './App.vue'
import VoerroTagsInput from '@voerro/vue-tagsinput';
import './assets/main.scss'

Vue.component('tags-input', VoerroTagsInput);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
