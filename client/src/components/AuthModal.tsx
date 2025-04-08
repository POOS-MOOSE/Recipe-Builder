import React, { type ChangeEventHandler, Fragment, useState } from 'react'
import { useModalStore } from 'store/useModalStore'
import { useAuth } from 'contexts/AuthContext'
import { Dialog, DialogTitle, TextField, Button, CircularProgress } from '@mui/material'
import { type FormData } from '@types'

interface Props {}

const AuthModal: React.FC<Props> = () => {
  const { login, register } = useAuth()
  const { currentModal, setCurrentModal } = useModalStore()

  const isRegisterMode = currentModal === 'REGISTER'
  const isOpen = ['AUTH', 'LOGIN', 'REGISTER'].includes(currentModal)
  const onClose = () => setCurrentModal('')

  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const clickSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      isRegisterMode ? await register(formData) : await login(formData)
      onClose()
    } catch (error: any) {
      setError(typeof error === 'string' ? error : JSON.stringify(error))
    }

    setLoading(false)
  }

  const isSubmitButtonDisabled = !formData['username'] || !formData['email'] || !formData['password']

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {isRegisterMode ? <DialogTitle>Create a new account</DialogTitle> : <DialogTitle>Login to your account</DialogTitle>}

      <TextField
        label='Username'
        name='username'
        type='text'
        value={formData['username']}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />
       <TextField
        label='Email'
        name='email'
        type='email'
        value={formData['email']}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />
      <TextField
        label='Password'
        name='password'
        type='password'
        value={formData['password']}
        onChange={handleChange}
        variant='filled'
        sx={{ mx: 2, my: 0.5 }}
        required
      />

      {error && <span className='error'>{error}</span>}

      {loading ? (
        <center>
          <CircularProgress color='inherit' />
        </center>
      ) : isRegisterMode ? (
        <Fragment>
          <Button onClick={clickSubmit} disabled={isSubmitButtonDisabled}>
            Register
          </Button>
          <Button onClick={() => setCurrentModal('LOGIN')}>I already have an account</Button>
        </Fragment>
      ) : (
        <Fragment>
          <Button onClick={clickSubmit} disabled={isSubmitButtonDisabled}>
            Login
          </Button>
          <Button onClick={() => setCurrentModal('REGISTER')}>I don't have an account</Button>
        </Fragment>
      )}
    </Dialog>
  )
}

export default AuthModal
