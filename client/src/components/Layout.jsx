import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, Drawer, AppBar, Toolbar, Typography, Divider, IconButton, 
  List, Avatar, Menu, MenuItem, Chip, useTheme, alpha 
} from '@mui/material';
import { 
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, 
  AccountCircle, Notifications as NotificationsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarItems from './SidebarItems';

const drawerWidth = 280;

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Reducir la sombra
    zIndex: theme.zIndex.drawer + 1,
    borderRadius: 0, // Asegurar que no tenga bordes redondeados
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 0,
      },
    }),
  }),
);

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? 0 : `-${drawerWidth}px`,
    backgroundColor: '#f8f9fa', // Color de fondo más suave
    minHeight: '100vh',
    width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
    overflow: 'hidden', // Evitar desbordamientos
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      width: '100%',
    },
  }),
);

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    boxShadow: 'none', // Eliminar la sombra del drawer
    position: 'fixed',
    height: '100%',
    zIndex: theme.zIndex.drawer,
    borderRadius: 0, // Asegurar que no tenga bordes redondeados
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
}));

const UserSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background: alpha(theme.palette.primary.main, 0.02),
}));

const Layout = ({ children, title }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'waiter': return 'info';
      case 'chef': return 'success';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'waiter': return 'Mesero';
      case 'chef': return 'Cocinero';
      case 'cashier': return 'Cajero';
      default: return role;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      overflow: 'hidden', // Evitar desbordamientos
      position: 'relative' // Asegurar posicionamiento correcto
    }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ 
              mr: 2, 
              ...(open && { display: 'none' }),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit" 
              sx={{ 
                '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) }
              }}
            >
              <NotificationsIcon />
            </IconButton>
            
            <IconButton 
              color="inherit"
              sx={{ 
                '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) }
              }}
            >
              <SettingsIcon />
            </IconButton>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ 
                ml: 1,
                '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) }
              }}
            >
              {currentUser?.fullName ? (
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.secondary.main,
                    width: 40,
                    height: 40,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircle sx={{ fontSize: 32 }} />
              )}
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  borderRadius: 2,
                  minWidth: 200
                }
              }}
            >
              <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2">{currentUser?.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentUser?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfile} sx={{ py: 1 }}>Perfil</MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'error.main' }}>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      <StyledDrawer
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                width: 40,
                height: 40,
                fontWeight: 'bold'
              }}
            >
              🍽️
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              SysRestaurant
            </Typography>
          </Box>
          <IconButton 
            onClick={handleDrawerClose}
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.1) }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        
        <UserSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 600
              }}
            >
              {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {currentUser?.fullName || 'Usuario'}
              </Typography>
              <Chip 
                label={getRoleText(currentUser?.role)}
                color={getRoleColor(currentUser?.role)}
                size="small"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            </Box>
          </Box>
        </UserSection>
        
        <List sx={{ pt: 2 }}>
          <SidebarItems />
        </List>
      </StyledDrawer>
      
      <Main open={open}>
        <DrawerHeader />
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;