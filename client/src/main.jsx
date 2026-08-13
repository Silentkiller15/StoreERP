import React from 'react'
import ReactDOM from 'react-dom/client'
import MainApp from './MainApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
)

// ==================================================
// STOREERP API AUTHENTICATION
// ==================================================
// Automatically attach the logged-in user's token
// to every Axios request.
// ==================================================

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "storeerp_token"
    );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================================================
// HANDLE AUTHENTICATION ERRORS
// ==================================================

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "storeerp_token"
      );

      localStorage.removeItem(
        "storeerp_user"
      );

      window.location.reload();
    }

    return Promise.reject(error);
  }
);

// ==================================================
// START STOREERP
// ==================================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);