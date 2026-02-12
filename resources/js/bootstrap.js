import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Laravel CSRF: read token from <meta name="csrf-token"> and send on every request
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;
}

// Also support the cookie-based approach as fallback
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;
