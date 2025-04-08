import React, { Fragment } from 'react'
import { useAuth } from 'contexts/AuthContext'
import AuthModal from 'components/AuthModal'
import Header from 'components/Header'
import logo from 'assets/react.svg'
import 'styles/ReactWelcome.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row } from 'react-bootstrap'

const App = () => {
  return (
    <div className='App'>
      <Header />
      <ReactWelcome />
      <LoggedInStatus />
      <AuthModal />
    </div>
  )
}

const ReactWelcome = () => {
  return (
    <Fragment>
      <img src={logo} className='ReactWelcome-logo' alt='logo' />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a className='ReactWelcome-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
        Learn React
      </a>
    </Fragment>
  )
}

const LoggedInStatus = () => {
  const { isLoggedIn, account } = useAuth()

  if (isLoggedIn && !!account) {
    return <p>Hey, {account.username}! I'm happy to let you know: you are authenticated!</p>
  }

  return <p>Don't forget to start your backend server, and then authenticate yourself.</p>
}

export default App
