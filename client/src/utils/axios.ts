import Axios from 'axios'
import { BACKEND_URL } from '../constants'

const axios = Axios.create({
  baseURL: BACKEND_URL,
})

export default axios
