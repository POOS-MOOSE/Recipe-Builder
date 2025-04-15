import React from 'react'
import AuthModal from 'components/AuthModal'
import Header from 'components/Header'
import Login from './login'
import Recipe from './recipe'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import 'styles/ReactWelcome.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const AppContent = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <div className='App'>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recipe" element={<Recipe />} />
      </Routes>
      <AuthModal />
    </div>
  );
}

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
)

export default App