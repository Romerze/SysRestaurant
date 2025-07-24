import React, { useState, useEffect } from 'react';
import { 
  Grid, Typography, Button, Card, CardContent, CardActions, Box, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, 
  Select, MenuItem, Avatar, LinearProgress, Fab, Tooltip, alpha, useTheme,
  Paper, Stack, IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  TableRestaurant as TableIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { tableService } from '../services/api';

const Tables = () => {
  const theme = useTheme();
  const [tables, setTables] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, status: 'available' });
  const [loading, setLoading] = useState(true);
  const [editingTable, setEditingTable] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await tableService.getTables();
      console.log('Response from API:', response);
      
      const tablesData = response?.data?.data || response?.data || [];
      
      if (Array.isArray(tablesData)) {
        setTables(tablesData);
      } else {
        console.warn('API response is not an array:', tablesData);
        setTables([
          { id: 1, number: 1, capacity: 4, status: 'available' },
          { id: 2, number: 2, capacity: 2, status: 'occupied' },
          { id: 3, number: 3, capacity: 6, status: 'reserved' },
          { id: 4, number: 4, capacity: 4, status: 'available' },
          { id: 5, number: 5, capacity: 8, status: 'available' },
          { id: 6, number: 6, capacity: 2, status: 'occupied' },
        ]);
      }
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      setTables([
        { id: 1, number: 1, capacity: 4, status: 'available' },
        { id: 2, number: 2, capacity: 2, status: 'occupied' },
        { id: 3, number: 3, capacity: 6, status: 'reserved' },
        { id: 4, number: 4, capacity: 4, status: 'available' },
        { id: 5, number: 5, capacity: 8, status: 'available' },
        { id: 6, number: 6, capacity: 2, status: 'occupied' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (table = null) => {
    if (table) {
      setEditingTable(table);
      setNewTable({ number: table.number, capacity: table.capacity, status: table.status });
    } else {
      setEditingTable(null);
      setNewTable({ number: '', capacity: 4, status: 'available' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTable({ number: '', capacity: 4, status: 'available' });
    setEditingTable(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable({ ...newTable, [name]: value });
  };

  const handleCreateOrUpdateTable = async () => {
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable.id, newTable);
      } else {
        await tableService.createTable(newTable);
      }
      fetchTables();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al crear/actualizar mesa:', error);
      alert('Error al procesar la mesa. Revisa la consola para más detalles.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await tableService.updateTable(id, { status });
      fetchTables();
    } catch (error) {
      console.error('Error al actualizar estado de mesa:', error);
      alert('Error al actualizar mesa. Revisa la consola para más detalles.');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
      try {
        await tableService.deleteTable(id);
        fetchTables();
      } catch (error) {
        console.error('Error al eliminar mesa:', error);
        alert('Error al eliminar mesa. Revisa la consola para más detalles.');
      }
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return { 
          color: 'success', 
          text: 'Disponible', 
          icon: <CheckCircleIcon />,
          bgColor: theme.palette.success.main,
          lightBg: alpha(theme.palette.success.main, 0.1)
        };
      case 'occupied':
        return { 
          color: 'error', 
          text: 'Ocupada', 
          icon: <BlockIcon />,
          bgColor: theme.palette.error.main,
          lightBg: alpha(theme.palette.error.main, 0.1)
        };
      case 'reserved':
        return { 
          color: 'warning', 
          text: 'Reservada', 
          icon: <ScheduleIcon />,
          bgColor: theme.palette.warning.main,
          lightBg: alpha(theme.palette.warning.main, 0.1)
        };
      default:
        return { 
          color: 'default', 
          text: status, 
          icon: <TableIcon />,
          bgColor: theme.palette.grey[500],
          lightBg: alpha(theme.palette.grey[500], 0.1)
        };
    }
  };

  const getStats = () => {
    const total = tables.length;
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    
    return { total, available, occupied, reserved };
  };

  const stats = getStats();

  const StatsCard = ({ title, value, color, icon, percentage }) => (
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
          {percentage !== undefined && (
            <Typography variant="body2" color="text.secondary">
              {percentage}% del total
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </Paper>
  );

  const TableCard = ({ table }) => {
    const statusConfig = getStatusConfig(table.status);
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          border: `2px solid ${alpha(statusConfig.bgColor, 0.2)}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${alpha(statusConfig.bgColor, 0.2)}`
          }
        }}
      >
        <Box 
          sx={{ 
            height: 8, 
            background: `linear-gradient(90deg, ${statusConfig.bgColor} 0%, ${alpha(statusConfig.bgColor, 0.7)} 100%)`
          }} 
        />
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: statusConfig.lightBg,
                color: statusConfig.bgColor,
                width: 48,
                height: 48
              }}
            >
              <TableIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Chip 
              icon={statusConfig.icon}
              label={statusConfig.text} 
              color={statusConfig.color}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mesa {table.number}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PeopleIcon color="action" />
            <Typography variant="body1" color="text.secondary">
              Capacidad: {table.capacity} personas
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Disponible">
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => handleUpdateStatus(table.id, 'available')}
                disabled={table.status === 'available'}
                sx={{ 
                  bgcolor: table.status === 'available' ? alpha(theme.palette.success.main, 0.1) : 'transparent'
                }}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Ocupada">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => handleUpdateStatus(table.id, 'occupied')}
                disabled={table.status === 'occupied'}
                sx={{ 
                  bgcolor: table.status === 'occupied' ? alpha(theme.palette.error.main, 0.1) : 'transparent'
                }}
              >
                <BlockIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Reservada">
              <IconButton 
                size="small" 
                color="warning" 
                onClick={() => handleUpdateStatus(table.id, 'reserved')}
                disabled={table.status === 'reserved'}
                sx={{ 
                  bgcolor: table.status === 'reserved' ? alpha(theme.palette.warning.main, 0.1) : 'transparent'
                }}
              >
                <ScheduleIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Editar">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleOpenDialog(table)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Eliminar">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDeleteTable(table.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout title="Gestión de Mesas">
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="h6" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Cargando mesas...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Mesas">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Gestión de Mesas
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Administra el estado y configuración de las mesas del restaurante
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualizar">
              <IconButton 
                color="primary" 
                onClick={fetchTables}
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
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Nueva Mesa
            </Button>
          </Stack>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Total de Mesas" 
              value={stats.total} 
              color={theme.palette.primary.main}
              icon={<TableIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Disponibles" 
              value={stats.available} 
              color={theme.palette.success.main}
              icon={<CheckCircleIcon />}
              percentage={stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Ocupadas" 
              value={stats.occupied} 
              color={theme.palette.error.main}
              icon={<BlockIcon />}
              percentage={stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Reservadas" 
              value={stats.reserved} 
              color={theme.palette.warning.main}
              icon={<ScheduleIcon />}
              percentage={stats.total > 0 ? Math.round((stats.reserved / stats.total) * 100) : 0}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Mesas */}
      <Grid container spacing={3}>
        {Array.isArray(tables) && tables.length > 0 ? (
          tables.map((table) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
              <TableCard table={table} />
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
              <TableIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No hay mesas disponibles
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Crea una nueva mesa para comenzar a gestionar tu restaurante
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Crear Primera Mesa
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* FAB para agregar mesa */}
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
        <AddIcon />
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
            {editingTable ? 'Editar Mesa' : 'Crear Nueva Mesa'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingTable ? 'Modifica los datos de la mesa' : 'Ingresa los datos de la nueva mesa'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            name="number"
            label="Número de Mesa"
            type="number"
            fullWidth
            variant="outlined"
            value={newTable.number}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
          />
          <TextField
            margin="dense"
            name="capacity"
            label="Capacidad (personas)"
            type="number"
            fullWidth
            variant="outlined"
            value={newTable.capacity}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth>
            <InputLabel>Estado Inicial</InputLabel>
            <Select
              name="status"
              value={newTable.status}
              label="Estado Inicial"
              onChange={handleInputChange}
            >
              <MenuItem value="available">Disponible</MenuItem>
              <MenuItem value="occupied">Ocupada</MenuItem>
              <MenuItem value="reserved">Reservada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateOrUpdateTable} 
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingTable ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Tables;