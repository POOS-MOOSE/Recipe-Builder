import React, { type MouseEventHandler, useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import OnlineIndicator from 'components/OnlineIndicator'
import { AppBar, IconButton, Avatar, Popover, List, ListSubheader, ListItemButton } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {}

const Header: React.FC<Props> = () => {
  const { isLoggedIn, account, logout } = useAuth()
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)
  const [popover, setPopover] = useState(false)

  const openPopover: MouseEventHandler<HTMLButtonElement> = (e) => {
    setPopover(true)
    setAnchorEl(e.currentTarget)
  }

  const closePopover = () => {
    setPopover(false)
    setAnchorEl(null)
  }

  const handleLogout = () => {

    logout()
    navigate('/login');
    closePopover();
  }

  return (
    <AppBar className='header' position='static'>
      <h1 style={{ fontSize: '1.5rem' }}>Meal Planner</h1>

      <IconButton style={{paddingBottom:'1rem'}} onClick={openPopover}>
        <OnlineIndicator online={isLoggedIn}>
          <Avatar src={account?.username || ''} alt={account?.username || 'Guest'} />
        </OnlineIndicator>
      </IconButton>

      <Popover
        anchorEl={anchorEl}
        open={popover}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List style={{ minWidth: '100px' }}>
          <ListSubheader style={{ textAlign: 'center' }}>Hello, {account?.username || 'Guest'}</ListSubheader>

          <ListItemButton onClick={handleLogout}>Logout</ListItemButton>
        </List>
      </Popover>
    </AppBar>
  )
}

export default Header
