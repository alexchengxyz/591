import 'element-plus/dist/index.css';
import './assets/main.css';

import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from './App.vue';


const app = createApp(App);

app.config.globalProperties.console = console;

app
  .use(ElementPlus)
  .mount('#app');
