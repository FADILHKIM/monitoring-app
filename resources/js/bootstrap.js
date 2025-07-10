import axios from 'axios';
import 'material-icons/iconfont/material-icons.css'; // Mengimpor Material Icons agar ikon muncul
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
