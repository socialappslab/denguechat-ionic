denguechat = {};
denguechat.env = {
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
  // @if ENV == 'IOS'
  baseURL: "http://127.0.0.1:5000/api/v0/",
  mainURL: "http://127.0.0.1:5000/",
  debug: true
  // @endif
  // @if ENV == 'DEVELOPMENT'
  baseURL: "http://localhost:5000/api/v0/",
  mainURL: "http://localhost:5000/",
  debug: true
  // @endif
  // @if ENV == 'STAGING'
  baseURL: "http://denguetorpedo-staging.herokuapp.com/api/v0/",
  mainURL: "http://denguetorpedo-staging.herokuapp.com/",
  debug: false
  // @endif
  // @if ENV == 'PRODUCTION'
  baseURL: "https://www.denguechat.org/api/v0/",
  mainURL: "https://www.denguechat.org/",
  debug: false
  // @endif
}
