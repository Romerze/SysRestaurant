import React from 'react';
import { 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Box, Typography, alpha, useTheme, Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  TableRestaurant as RestaurantIcon, 
  MenuBook as MenuIcon, 
  Receipt as ReceiptIcon, 
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Kitchen as KitchenIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarItems = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/',
      color: '#1976d2',
      description: 'Resumen general'
    },
    { 
      text: 'Mesas', 
      icon: <RestaurantIcon />, 
      path: '/tables',
      color: '#388e3c',
      description: 'Gestión de mesas'
    },
    { 
      text: 'Menú', 
      icon: <MenuIcon />, 
      path: '/menu',
      color: '#f57c00',
      description: 'Productos y categorías'
    },
    { 
      text: 'Órdenes', 
      icon: <ReceiptIcon />, 
      path: '/orders',
      color: '#7b1fa2',
      description: 'Gestión de pedidos'
    },
  ];

  // Agregar opción de usuarios solo para administradores
  if (isAdmin) {
    menuItems.push({ 
      text: 'Usuarios', 
      icon: <PeopleIcon />, 
      path: '/users',
      color: '#d32f2f',
      description: 'Gestión de personal'
    });
  }

  const MenuSection = ({ title, items }) => (
    <Box sx={{ mb: 2 }}>
      <Typography 
        variant="overline" 
        sx={{ 
          px: 3, 
          py: 1, 
          display: 'block',
          fontWeight: 600,
          color: 'text.secondary',
          fontSize: '0.75rem',
          letterSpacing: 1
        }}
      >
        {title}
      </Typography>
      {items.map((item) => {
        const isSelected = location.pathname === item.path;
        return (
          <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
            <ListItemButton 
              selected={isSelected}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: alpha(item.color, 0.12),
                  borderLeft: `4px solid ${item.color}`,
                  '&:hover': {
                    backgroundColor: alpha(item.color, 0.16),
                  },
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color,
                    fontWeight: 600,
                  }
                },
                '&:hover': {
                  backgroundColor: alpha(item.color, 0.08),
                  transform: 'translateX(4px)',
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  }
                },
                py: 1.5,
                px: 2
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  transition: 'color 0.2s ease',
                  color: isSelected ? item.color : 'text.secondary'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.95rem'
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
              />
              {isSelected && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    ml: 1
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </Box>
  );

  const mainItems = menuItems.slice(0, 4);
  const adminItems = menuItems.slice(4);

  return (
    <Box>
      <MenuSection title="Principal" items={mainItems} />
      {isAdmin && adminItems.length > 0 && (
        <MenuSection title="Administración" items={adminItems} />
      )}
      
      {/* Sección de estadísticas rápidas */}
      <Box sx={{ px: 3, py: 2, mt: 4 }}>
        <Typography 
          variant="overline" 
          sx={{ 
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '0.75rem',
            letterSpacing: 1,
            mb: 2,
            display: 'block'
          }}
        >
          Estado Rápido
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1.5,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.success.main, 0.08),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}
          >
            <Typography variant="caption" color="success.main" fontWeight={600}>
              Mesas Activas
            </Typography>
            <Chip 
              label="6/10" 
              size="small" 
              color="success" 
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1.5,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}
          >
            <Typography variant="caption" color="warning.main" fontWeight={600}>
              Órdenes Pendientes
            </Typography>
            <Chip 
              label="3" 
              size="small" 
              color="warning" 
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarItems;