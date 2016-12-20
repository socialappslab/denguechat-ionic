clovi = {};
clovi.env = {
  error: "error",
  auth: {
    success: "auth:success",
    failure:   "auth:failure"
  },
  data: {
    refresh: "data.refresh"
  },
  // @if ENV == 'GENYMOTION'
  baseURL: "http://10.0.3.2:5000/api/v0/",
  mainURL: "http://10.0.3.2:5000/",
  debug: true
  // @endif
  // @if ENV == 'DEVELOPMENT'
  baseURL: "http://localhost:5000/api/v0/",
  mainURL: "http://localhost:5000/",
  debug: true
  // @endif
  // @if ENV == 'PRODUCTION'
  baseURL: "https://www.denguechat.com/api/v0/",
  mainURL: "https://www.denguechat.com/",
  debug: false
  // @endif
}
