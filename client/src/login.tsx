import React, { useState } from 'react'
import { Button, Card, CardGroup, FloatingLabel, FormControl, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css'

const Login = () => {
  const [checkLogin, setCheckLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = {
        username,
        password,
      };

      if (checkLogin) {
        await login(formData);
      } else {
        await register(formData);
      }
      
      navigate('/recipe');
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

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
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  {checkLogin ? 'Sign In' : 'New Account'}</Card.Header>
                <Card.Body>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <form onSubmit={handleSubmit}>
                    <FloatingLabel
                      controlId="floatingUsername"
                      label="Username"
                      className="mb-3"
                    >
                      <FormControl
                        size="sm"
                        type="text"
                        className="rounded-0"
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </FloatingLabel>
                    <FloatingLabel
                      controlId="floatingPassword"
                      label="Password"
                      className="mb-3"
                    >
                      <FormControl
                        size="sm"
                        type="password"
                        className="rounded-0"
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </FloatingLabel>
                    <div className="d-flex justify-content-between p-0 mt-5">
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => {
                          setCheckLogin(prev => !prev);
                          setError('');
                        }}
                        type="button"
                        disabled={loading}
                      >
                        {checkLogin ? "Don't have an account?" : "Back to login"}
                      </Button>
                      <Button 
                        className="rounded-0" 
                        size="sm" 
                        variant="primary" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : (checkLogin ? 'Login' : 'Register')}
                      </Button>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </div>
          </Card>
        </CardGroup>
      </div>
  )
}

export default Login