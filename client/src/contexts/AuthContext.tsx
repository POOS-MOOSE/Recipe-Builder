import React, { createContext, useContext, useState, useEffect, type PropsWithChildren, useMemo } from 'react'
import axios from 'utils/axios'
import { type FormData, type Account } from '@types'

interface Context {
  token: string | null
  account: Account | null
  isLoggedIn: boolean
  register: (payload: FormData) => Promise<any>
  login: (payload: FormData) => Promise<any>
  logout: () => void
}

const initContext: Context = {
  token: null,
  account: null,
  isLoggedIn: false,
  register: async () => {},
  login: async () => {},
  logout: () => {},
}

// init context
const AuthContext = createContext(initContext)
const { Provider } = AuthContext

// export the consumer
export const useAuth = () => useContext(AuthContext)

// export the provider
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState(localStorage.getItem('token') || initContext.token)
  const [account, setAccount] = useState(initContext.account)
  const [isLoggedIn, setIsLoggedIn] = useState(initContext.isLoggedIn)

  const register = (formData: FormData) => {
    return new Promise((resolve, reject) => {
      axios
        .post('/auth/register', formData)
        .then(({ data: { data: accountData, token: accessToken } }) => {
          setAccount(accountData)
          setToken(accessToken)
          setIsLoggedIn(true)
          resolve(true)
        })
        .catch((error) => {
          reject(error?.response?.data?.message || error.message)
        })
    })
  }

  const login = (formData: FormData) => {
    return new Promise((resolve, reject) => {
      axios
        .post('/auth/login', formData)
        .then(({ data: { data: accountData, token: accessToken } }) => {
          setAccount(accountData)
          setToken(accessToken)
          setIsLoggedIn(true)
          resolve(true)
        })
        .catch((error) => {
          reject(error?.response?.data?.message || error.message)
        })
    })
  }

  const logout = () => {
    setIsLoggedIn(false)
    setAccount(null)
    setToken(null)
  }

  const loginWithToken = async () => {
    try {
      const {
        data: { data: accountData, token: accessToken },
      } = await axios.get('/auth/login', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      setAccount(accountData)
      setToken(accessToken)
      setIsLoggedIn(true)
    } catch (error: any) {
      console.error(error)
      if (error?.response?.statusCode === 401) setToken(null)
    }
  }

  // This side effect keeps local storage updated with recent token value,
  // making sure it can be re-used upon refresh or re-open browser
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  // This side effect runs only if we have a token, but no account or logged-in boolean.
  // This "if" statement is "true" only when refreshed, or re-opened the browser,
  // if true, it will then ask the backend for the account information (and will get them if the token hasn't expired)
  useEffect(() => {
    if (!isLoggedIn && !account && token) loginWithToken()
  }, [isLoggedIn, account, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({ token, account, isLoggedIn, register, login, logout }), [token, account, isLoggedIn])

  return <Provider value={value}>{children}</Provider>
}
