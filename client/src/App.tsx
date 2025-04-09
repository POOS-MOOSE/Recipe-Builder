import React from 'react'
import { useState } from 'react'
// import { useAuth } from 'contexts/AuthContext'
import AuthModal from 'components/AuthModal'
import Header from 'components/Header'
// import logo from 'assets/react.svg'
import 'styles/ReactWelcome.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button, Card, CardGroup, FloatingLabel, FormControl } from 'react-bootstrap'

const App = () => {
  return (
    <div className='App'>
      <Header />
      <ReactWelcome />
      {/* <LoggedInStatus /> */}
      <AuthModal />
    </div>
  )
}

const ReactWelcome = () => {
  const [checkLogin, setCheckLogin] = useState(true);
  return (
      <div
        style={{
          backgroundImage: `url(${'/imgs/IMG_9302.webp'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
        className="d-flex justify-content-center align-items-center min-vh-100"
      >
        {/* <Container> */}
        <CardGroup>
          <Card
            className="d-flex flex-row h-100 align-items-stretch rounded-0"
            style={{
              backgroundColor: 'black',
              width: '650px',
              height: '400px',
            }}
          >
            <Card.Img
              variant="top"
              src={'/imgs/Matthew-Gerber790edit-scaled.jpg'}
              alt="logo"
              className="w-50 object-fit-cover rounded-0"
              style={{
                maxWidth: '400px',
                maxHeight: '400px',
                objectFit: 'contain',
                overflow: 'hidden',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
              }}
            />
            <div className="d-flex flex-column w-50">
              <Card
                className="flex-grow-1 h-100 rounded-0"
                style={{
                  backgroundColor: '#212529'
                }}
              >
                <Card.Header
                  className="text-center rounded-0"
                  style={{
                    backgroundColor: '#2b3035',
                    color: 'white'
                  }}
                >
                  {checkLogin ? 'Sign In' : 'New Account'}</Card.Header>
                <Card.Body>
                  <FloatingLabel
                    controlId="floatingInput"
                    label="Username"
                    className="mb-3 mt-4"
                  >
                    <FormControl
                      size="sm"
                      type="username"
                      className="rounded-0"
                      placeholder='Username'
                    />
                  </FloatingLabel>
                  <FloatingLabel
                    controlId="floatingPassword"
                    label="Password"
                    className="mb-3 mt-4"
                  >
                    <FormControl
                      size="sm"
                      type="password"
                      className="rounded-0"
                      placeholder='Password'
                    />
                  </FloatingLabel>
                  <div className="d-flex justify-content-between p-0 mt-5">
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => setCheckLogin(prev => !prev)}
                    >
                      {checkLogin ? "Don't have an account?" : "Back to login"}
                    </Button>
                    <Button className="rounded-0" size="sm" variant="primary" type="submit">
                      {checkLogin ? 'Login' : 'Register'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Card>
        </CardGroup>
        {/* </Container> */}
      </div>
  )
}

// const LoggedInStatus = () => {
//   const { isLoggedIn, account } = useAuth()

//   if (isLoggedIn && !!account) {
//     return <p>Hey, {account.username}! I'm happy to let you know: you are authenticated!</p>
//   }

//   return <p>Don't forget to start your backend server, and then authenticate yourself.</p>
// }

export default App
