import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, 
  IconButton, Alert, Avatar, Card, CardContent, CardActions,
  Chip, Fab, Tooltip, alpha, useTheme, LinearProgress, Stack, Badge,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, FormControlLabel, Divider
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Person as PersonIcon, AdminPanelSettings as AdminIcon,
  Restaurant as WaiterIcon, Kitchen as ChefIcon, 
  AttachMoney as CashierIcon, Search as SearchIcon,
  FilterList as FilterIcon, Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon, Group as GroupIcon,
  Security as SecurityIcon, CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

const Users = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'waiter',
    active: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.user.getAll();
      let usersData = [];
      if (response && response.data) {
        if (response.data.success && response.data.data) {
          usersData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        } else if (Array.isArray(response.data)) {
          usersData = response.data;
        } else {
          usersData = [response.data];
        }
      } else if (response && Array.isArray(response)) {
        usersData = response;
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar usuarios. Mostrando datos de ejemplo.');
      
      setUsers([
        {
          id: 1,
          username: 'admin',
          fullName: 'Administrador Principal',
          role: 'admin',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: '2024-01-20T10:30:00Z'
        },
        {
          id: 2,
          username: 'mesero1',
          fullName: 'Juan Pérez',
          role: 'waiter',
          active: true,
          createdAt: '2024-01-10T00:00:00Z',
          lastLogin: '2024-01-19T14:20:00Z'
        },
        {
          id: 3,
          username: 'cocinero1',
          fullName: 'María García',
          role: 'chef',
          active: true,
          createdAt: '2024-01-12T00:00:00Z',
          lastLogin: '2024-01-19T08:15:00Z'
        },
        {
          id: 4,
          username: 'cajero1',
          fullName: 'Carlos López',
          role: 'cashier',
          active: false,
          createdAt: '2024-01-15T00:00:00Z',
          lastLogin: '2024-01-18T16:45:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser({
        ...user,
        password: ''
      });
      setIsEditing(true);
    } else {
      setCurrentUser({
        username: '',
        fullName: '',
        password: '',
        role: 'waiter',
        active: true
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!currentUser.username || !currentUser.fullName || (!isEditing && !currentUser.password)) {
        alert('Por favor, completa todos los campos requeridos');
        return;
      }

      if (isEditing) {
        await api.user.update(currentUser.id, currentUser);
      } else {
        await api.user.create(currentUser);
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar usuario: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await api.user.delete(id);
        loadUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'waiter': return 'Mesero';
      case 'chef': return 'Cocinero';
      case 'cashier': return 'Cajero';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return theme.palette.error.main;
      case 'waiter': return theme.palette.primary.main;
      case 'chef': return theme.palette.warning.main;
      case 'cashier': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'waiter': return <WaiterIcon />;
      case 'chef': return <ChefIcon />;
      case 'cashier': return <CashierIcon />;
      default: return <PersonIcon />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && user.active) ||
                         (selectedStatus === 'inactive' && !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStats = () => {
    const total = users.length;
    const active = users.filter(u => u.active).length;
    const byRole = {
      admin: users.filter(u => u.role === 'admin').length,
      waiter: users.filter(u => u.role === 'waiter').length,
      chef: users.filter(u => u.role === 'chef').length,
      cashier: users.filter(u => u.role === 'cashier').length
    };
    return { total, active, byRole };
  };

  const stats = getStats();

  const StatsCard = ({ title, value, color, icon, subtitle }) => (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.15)}`
        }
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h3" fontWeight="bold" color={color} gutterBottom>
            {value}
          </Typography>
          <Typography variant="h6" color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </Paper>
  );

  const UserCard = ({ user }) => (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: getRoleColor(user.role),
              width: 56,
              height: 56,
              mr: 2
            }}
          >
            {getRoleIcon(user.role)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {user.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            {user.active ? (
              <ActiveIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
            ) : (
              <InactiveIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip 
            label={getRoleText(user.role)}
            sx={{ 
              bgcolor: alpha(getRoleColor(user.role), 0.1),
              color: getRoleColor(user.role),
              fontWeight: 600
            }}
          />
          <Chip 
            label={user.active ? 'Activo' : 'Inactivo'}
            color={user.active ? 'success' : 'default'}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={1}>
          <strong>Creado:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </Typography>
        {user.lastLogin && (
          <Typography variant="body2" color="text.secondary">
            <strong>Último acceso:</strong> {new Date(user.lastLogin).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            ID: {user.id}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleOpenDialog(user)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={user.role === 'admin' ? 'No se puede eliminar admin' : 'Eliminar'}>
            <span>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDelete(user.id)}
                disabled={user.role === 'admin'}
                sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
                  '&:disabled': { bgcolor: alpha(theme.palette.grey[400], 0.1) }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Layout title="Gestión de Usuarios">
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="h6" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Cargando usuarios...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Usuarios">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Administra los usuarios y permisos del sistema
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualizar">
              <IconButton 
                color="primary" 
                onClick={loadUsers}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Nuevo Usuario
            </Button>
          </Stack>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Total de Usuarios" 
              value={stats.total} 
              color={theme.palette.primary.main}
              icon={<GroupIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Usuarios Activos" 
              value={stats.active} 
              color={theme.palette.success.main}
              icon={<ActiveIcon />}
              subtitle={`${stats.total - stats.active} inactivos`}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Administradores" 
              value={stats.byRole.admin} 
              color={theme.palette.error.main}
              icon={<AdminIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Personal" 
              value={stats.byRole.waiter + stats.byRole.chef + stats.byRole.cashier} 
              color={theme.palette.secondary.main}
              icon={<SecurityIcon />}
            />
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por rol</InputLabel>
                <Select
                  value={selectedRole}
                  label="Filtrar por rol"
                  onChange={(e) => setSelectedRole(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los roles</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="waiter">Mesero</MenuItem>
                  <MenuItem value="chef">Cocinero</MenuItem>
                  <MenuItem value="cashier">Cajero</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Filtrar por estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="active">Activos</MenuItem>
                  <MenuItem value="inactive">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('');
                  setSelectedStatus('');
                }}
                sx={{ height: 56, borderRadius: 2 }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Vista de tarjetas para pantallas grandes */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Grid container spacing={3}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} lg={4} key={user.id}>
                <UserCard user={user} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  borderRadius: 3,
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  {searchTerm || selectedRole || selectedStatus ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  {searchTerm || selectedRole || selectedStatus ? 
                    'Intenta cambiar los filtros de búsqueda' : 
                    'Crea el primer usuario para comenzar a gestionar el sistema'
                  }
                </Typography>
                {!searchTerm && !selectedRole && !selectedStatus && (
                  <Button 
                    variant="contained" 
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Crear Primer Usuario
                  </Button>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Vista de tabla para pantallas pequeñas */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {user.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleText(user.role)} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getRoleColor(user.role), 0.1),
                          color: getRoleColor(user.role)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.active ? 'Activo' : 'Inactivo'} 
                        color={user.active ? 'success' : 'default'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(user)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(user.id)}
                          color="error"
                          disabled={user.role === 'admin'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay usuarios disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* FAB */}
      <Fab 
        color="primary" 
        aria-label="add"
        onClick={() => handleOpenDialog()}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
        }}
      >
        <PersonAddIcon />
      </Fab>

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? 'Modifica los datos del usuario' : 'Ingresa los datos del nuevo usuario'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                fullWidth
                label="Nombre de usuario"
                name="username"
                value={currentUser.username}
                onChange={handleInputChange}
                disabled={isEditing}
                required
                helperText={isEditing ? "No se puede cambiar el nombre de usuario" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="fullName"
                value={currentUser.fullName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                name="password"
                type="password"
                value={currentUser.password}
                onChange={handleInputChange}
                required={!isEditing}
                helperText={isEditing ? "Deja en blanco para mantener la contraseña actual" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="role"
                  value={currentUser.role}
                  label="Rol"
                  onChange={handleInputChange}
                >
                  <MenuItem value="admin">
                    <Box display="flex" alignItems="center">
                      <AdminIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                      Administrador
                    </Box>
                  </MenuItem>
                  <MenuItem value="waiter">
                    <Box display="flex" alignItems="center">
                      <WaiterIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Mesero
                    </Box>
                  </MenuItem>
                  <MenuItem value="chef">
                    <Box display="flex" alignItems="center">
                      <ChefIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                      Cocinero
                    </Box>
                  </MenuItem>
                  <MenuItem value="cashier">
                    <Box display="flex" alignItems="center">
                      <CashierIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                      Cajero
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentUser.active}
                    onChange={(e) => setCurrentUser({
                      ...currentUser,
                      active: e.target.checked
                    })}
                    color="success"
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    {currentUser.active ? (
                      <ActiveIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    ) : (
                      <InactiveIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                    )}
                    {currentUser.active ? 'Usuario Activo' : 'Usuario Inactivo'}
                  </Box>
                }
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ px: 4 }}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Users;