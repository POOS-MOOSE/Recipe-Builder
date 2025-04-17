// api url (where your server is hosted at)
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server.fullybaked.me' 
  : 'http://localhost:8080'

export { BACKEND_URL }
