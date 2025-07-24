import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Avatar,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  TableRestaurant as TableIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalDining as LocalDiningIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  Pending as PendingIcon,
  Kitchen as KitchenIcon,
  Check as CheckIcon,
  AttachMoney as MoneyIcon,
  TaskAlt as CompletedIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Layout from '../components/Layout';
import apiServices from '../services/api';

// Alias para apiServices
const api = apiServices;

// Styled Components
const StatsCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
  border: `2px solid ${alpha(theme.palette[color].main, 0.2)}`,
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.15)}`,
    border: `2px solid ${alpha(theme.palette[color].main, 0.3)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
  }
}));

const OrderCard = styled(Card)(({ theme, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme.palette.warning.main;
      case 'preparing': return theme.palette.info.main;
      case 'ready': return theme.palette.success.main;
      case 'delivered': return theme.palette.primary.main;
      default: return theme.palette.grey[500];
    }
  };

  return {
    background: `linear-gradient(135deg, ${alpha(getStatusColor(status), 0.05)} 0%, ${alpha(getStatusColor(status), 0.02)} 100%)`,
    border: `2px solid ${alpha(getStatusColor(status), 0.2)}`,
    borderRadius: 16,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 16px ${alpha(getStatusColor(status), 0.15)}`,
      border: `2px solid ${alpha(getStatusColor(status), 0.4)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, ${getStatusColor(status)}, ${alpha(getStatusColor(status), 0.7)})`,
    }
  };
});

// Componente para mostrar el estado de carga
const LoadingSelect = ({ label }) => (
  <FormControl fullWidth disabled>
    <InputLabel>{label}</InputLabel>
    <Select value="" label={label}>
      <MenuItem disabled>
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={16} />
          <Typography>Cargando...</Typography>
        </Box>
      </MenuItem>
    </Select>
  </FormControl>
);

const Orders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [newOrder, setNewOrder] = useState({
    tableNumber: '',
    items: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOrders(),
        loadTables(),
        loadProducts()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showSnackbar('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      console.log('🔄 Iniciando carga de órdenes...');
      const response = await api.order.getAll();
      console.log('📦 Respuesta completa de órdenes:', response);
      console.log('📊 Tipo de response.data:', typeof response.data);
      console.log('📋 Es array response.data:', Array.isArray(response.data));
      
      let ordersData = [];
      
      if (Array.isArray(response.data)) {
        ordersData = response.data;
        console.log('✅ Datos de órdenes como array directo:', ordersData);
      } else if (response.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
        console.log('✅ Datos de órdenes desde response.data.data:', ordersData);
      } else if (response.data && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
        console.log('✅ Datos de órdenes desde response.data.orders:', ordersData);
      } else {
        console.log('⚠️ Formato de respuesta no reconocido, usando array vacío');
        ordersData = [];
      }
      
      console.log('🎯 Órdenes finales a establecer:', ordersData);
      console.log('📊 Cantidad de órdenes:', ordersData.length);
      
      // Logging detallado de cada orden
      ordersData.forEach((order, index) => {
        console.log(`📋 Orden ${index + 1}:`, order);
        console.log(`📋 Orden ${index + 1} - ID:`, order.id);
        console.log(`📋 Orden ${index + 1} - Table:`, order.Table);
        console.log(`📋 Orden ${index + 1} - tableNumber:`, order.tableNumber);
        console.log(`📋 Orden ${index + 1} - Table.number:`, order.Table?.number);
        console.log(`📋 Orden ${index + 1} - status:`, order.status);
        console.log(`📋 Orden ${index + 1} - total:`, order.total);
      });
      
      setOrders(ordersData);
      showSnackbar(`Se cargaron ${ordersData.length} órdenes correctamente`, 'success');
    } catch (error) {
      console.error('❌ Error al cargar órdenes:', error);
      console.error('❌ Detalles del error:', error.response?.data || error.message);
      setOrders([]);
      showSnackbar('Error al cargar las órdenes', 'error');
    }
  };

  const loadTables = async () => {
    setLoadingTables(true);
    try {
      console.log('=== CARGA DE MESAS ===');
      console.log('Iniciando carga de mesas...');
      const response = await api.table.getAll();
      console.log('Respuesta completa de mesas:', response);
      console.log('response.data:', response.data);
      console.log('Tipo de response.data:', typeof response.data);
      console.log('Es array response.data?:', Array.isArray(response.data));
      
      // Inspeccionar todas las propiedades de response.data
      if (response.data && typeof response.data === 'object') {
        console.log('Propiedades de response.data:', Object.keys(response.data));
        console.log('Valores de response.data:', Object.values(response.data));
      }
      
      // Verificar diferentes estructuras de respuesta
      let tablesData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          tablesData = response.data;
        } else if (response.data.tables && Array.isArray(response.data.tables)) {
          tablesData = response.data.tables;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          tablesData = response.data.data;
        } else {
          console.log('Estructura de datos no reconocida, intentando convertir objeto a array');
          tablesData = Object.values(response.data);
        }
      } else if (Array.isArray(response)) {
        tablesData = response;
      }
      
      console.log('Datos de mesas procesados:', tablesData);
      console.log('Cantidad de mesas:', tablesData.length);
      
      // Asegurar que se establezca el estado
      setTables(tablesData);
      
      if (tablesData.length === 0) {
        showSnackbar('No se encontraron mesas', 'warning');
      } else {
        showSnackbar(`Se cargaron ${tablesData.length} mesas correctamente`, 'success');
      }
      
      return tablesData;
    } catch (error) {
      console.error('Error detallado al cargar mesas:', error);
      setTables([]);
      showSnackbar('Error al cargar las mesas', 'error');
      throw error;
    } finally {
      setLoadingTables(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      console.log('=== CARGA DE PRODUCTOS ===');
      console.log('Iniciando carga de productos...');
      const response = await api.product.getAll();
      console.log('Respuesta completa de productos:', response);
      console.log('response.data:', response.data);
      console.log('Tipo de response.data:', typeof response.data);
      console.log('Es array response.data?:', Array.isArray(response.data));
      
      // Inspeccionar todas las propiedades de response.data
      if (response.data && typeof response.data === 'object') {
        console.log('Propiedades de response.data:', Object.keys(response.data));
        console.log('Valores de response.data:', Object.values(response.data));
      }
      
      // Verificar diferentes estructuras de respuesta
      let productsData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else {
          console.log('Estructura de datos no reconocida, intentando convertir objeto a array');
          productsData = Object.values(response.data);
        }
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      console.log('Datos de productos procesados:', productsData);
      console.log('Cantidad de productos:', productsData.length);
      
      // Asegurar que se establezca el estado
      setProducts(productsData);
      
      if (productsData.length === 0) {
        showSnackbar('No se encontraron productos', 'warning');
      } else {
        showSnackbar(`Se cargaron ${productsData.length} productos correctamente`, 'success');
      }
      
      return productsData;
    } catch (error) {
      console.error('Error detallado al cargar productos:', error);
      setProducts([]);
      showSnackbar('Error al cargar los productos', 'error');
      throw error;
    } finally {
      setLoadingProducts(false);
    }
  };

  // Funciones de manejo de eventos
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleOpenCreateDialog = async () => {
    console.log('=== DEPURACIÓN DIÁLOGO ===');
    console.log('Abriendo diálogo de crear orden');
    console.log('Estado actual de mesas:', tables);
    console.log('Longitud de mesas:', tables.length);
    console.log('Tipo de mesas:', typeof tables, Array.isArray(tables));
    console.log('Estado actual de productos:', products);
    console.log('Longitud de productos:', products.length);
    console.log('Tipo de productos:', typeof products, Array.isArray(products));
    console.log('Loading states - Tables:', loadingTables, 'Products:', loadingProducts);
    
    // Mostrar indicador de carga mientras se cargan los datos
    setLoadingTables(true);
    setLoadingProducts(true);
    
    try {
      console.log('Cargando datos antes de abrir diálogo...');
      
      // Esperar a que se carguen ambos conjuntos de datos
      await Promise.all([
        loadTables(),
        loadProducts()
      ]);
      
      console.log('Datos cargados, verificando estado final...');
      
      // Pequeña pausa para asegurar que el estado se actualice
      setTimeout(() => {
        console.log('Estado final de mesas:', tables);
        console.log('Estado final de productos:', products);
        
        // Ahora abrir el diálogo
        setOpenCreateDialog(true);
        setNewOrder({
          tableNumber: '',
          items: []
        });
      }, 200);
      
    } catch (error) {
      console.error('Error al cargar datos para el diálogo:', error);
      showSnackbar('Error al cargar datos. Inténtalo de nuevo.', 'error');
    }
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewOrder({
      tableNumber: '',
      items: []
    });
  };

  const getTableStatusText = (table) => {
    switch (table.status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      default: return table.status;
    }
  };

  const getTableStatusColor = (table) => {
    switch (table.status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'reserved': return 'warning';
      default: return 'default';
    }
  };

  const handleAddProduct = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0, productName: '' }]
    }));
  };

  const handleRemoveProduct = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { ...item, productId, price: product?.price || 0, productName: product?.name || '' }
          : item
      )
    }));
  };

  const handleQuantityChange = (index, quantity) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity: parseInt(quantity) || 1 } : item
      )
    }));
  };

  const calculateTotal = () => {
    return newOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async () => {
    try {
      console.log('=== CREANDO ORDEN ===');
      console.log('Estado de newOrder:', newOrder);
      console.log('tableNumber:', newOrder.tableNumber);
      console.log('items:', newOrder.items);
      console.log('items.length:', newOrder.items.length);
      
      if (!newOrder.tableNumber || newOrder.items.length === 0) {
        console.log('Validación fallida:');
        console.log('- tableNumber válido?:', !!newOrder.tableNumber);
        console.log('- items no vacío?:', newOrder.items.length > 0);
        showSnackbar('Por favor selecciona una mesa y agrega al menos un producto', 'warning');
        return;
      }

      // Encontrar el ID de la mesa basado en el número
      const selectedTable = tables.find(table => table.number === parseInt(newOrder.tableNumber));
      if (!selectedTable) {
        console.log('Mesa no encontrada:', newOrder.tableNumber);
        console.log('Mesas disponibles:', tables);
        showSnackbar('Mesa no encontrada. Por favor selecciona una mesa válida.', 'error');
        return;
      }

      console.log('Mesa seleccionada:', selectedTable);

      // Validar que todos los productos tengan ID válido
      const invalidItems = newOrder.items.filter(item => !item.productId || !item.quantity || item.quantity <= 0);
      if (invalidItems.length > 0) {
        console.log('Items inválidos encontrados:', invalidItems);
        showSnackbar('Todos los productos deben tener una cantidad válida mayor a 0', 'warning');
        return;
      }

      const orderData = {
        tableId: selectedTable.id, // Usar el ID de la mesa, no el número
        items: newOrder.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        })),
        notes: '' // Agregar campo notes si es necesario
      };

      console.log('Datos de la orden a enviar:', orderData);
      console.log('Total calculado:', calculateTotal());
      
      console.log('Enviando orden al servidor...');
      const response = await api.order.create(orderData);
      console.log('Respuesta del servidor:', response);
      
      handleCloseCreateDialog();
      loadOrders();
      showSnackbar('Orden creada exitosamente', 'success');
    } catch (error) {
      console.error('Error detallado al crear orden:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Mostrar mensaje más específico según el tipo de error
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Datos inválidos';
        showSnackbar(`Error de validación: ${errorMessage}`, 'error');
      } else if (error.response?.status === 401) {
        showSnackbar('No autorizado para crear órdenes. Inicia sesión nuevamente.', 'error');
      } else if (error.response?.status === 403) {
        showSnackbar('No tienes permisos para crear órdenes.', 'error');
      } else if (error.response?.status === 500) {
        showSnackbar('Error interno del servidor. Contacta al administrador.', 'error');
      } else {
        showSnackbar('Error al crear la orden. Inténtalo de nuevo.', 'error');
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.order.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          text: 'Pendiente', 
          color: 'warning', 
          icon: <PendingIcon />,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          borderColor: theme.palette.warning.main
        };
      case 'preparing':
        return { 
          text: 'Preparando', 
          color: 'info', 
          icon: <TimeIcon />,
          bgColor: alpha(theme.palette.info.main, 0.1),
          borderColor: theme.palette.info.main
        };
      case 'ready':
        return { 
          text: 'Listo', 
          color: 'success', 
          icon: <CompletedIcon />,
          bgColor: alpha(theme.palette.success.main, 0.1),
          borderColor: theme.palette.success.main
        };
      case 'delivered':
        return { 
          text: 'Entregado', 
          color: 'success', 
          icon: <CompletedIcon />,
          bgColor: alpha(theme.palette.success.main, 0.1),
          borderColor: theme.palette.success.main
        };
      default:
        return { 
          text: status, 
          color: 'default', 
          icon: <TimeIcon />,
          bgColor: alpha(theme.palette.grey[500], 0.1),
          borderColor: theme.palette.grey[500]
        };
    }
  };

  // Calcular estadísticas con validación de arrays
  const getStats = () => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return {
        total: 0,
        pending: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        totalRevenue: 0
      };
    }

    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const preparing = orders.filter(order => order.status === 'preparing').length;
    const ready = orders.filter(order => order.status === 'ready').length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    
    // Calcular ingresos totales con validación
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total) || 0;
      return sum + orderTotal;
    }, 0);

    return { total, pending, preparing, ready, delivered, totalRevenue };
  };

  const stats = getStats();

  // Componente de tarjeta de estadísticas (igual que en Tables)
  const StatsCard = ({ title, value, icon, color, bgColor }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${bgColor} 0%, ${alpha(bgColor, 0.1)} 100%)`,
        border: `2px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
          borderColor: alpha(color, 0.4)
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box sx={{ color, mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h3" fontWeight="bold" color={color} gutterBottom>
          {value}
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  // Componente de tarjeta de orden (similar a TableCard)
  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          border: `2px solid ${alpha(statusConfig.borderColor, 0.2)}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${alpha(statusConfig.borderColor, 0.2)}`
          }
        }}
      >
        <Box 
          sx={{ 
            height: 8, 
            background: `linear-gradient(90deg, ${statusConfig.borderColor} 0%, ${alpha(statusConfig.borderColor, 0.7)} 100%)`
          }} 
        />
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: statusConfig.bgColor,
                color: statusConfig.borderColor,
                width: 48,
                height: 48
              }}
            >
              <RestaurantIcon sx={{ fontSize: 24 }} />
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
            Orden #{order.id}
          </Typography>
          
          <Stack spacing={1} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <TableIcon color="action" sx={{ fontSize: 18 }} />
              <Typography variant="body1" color="text.secondary">
                Mesa: {order.Table?.number || order.tableNumber || 'N/A'}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <TimeIcon color="action" sx={{ fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(order.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <MoneyIcon color="success" sx={{ fontSize: 18 }} />
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${(order.total || 0).toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewOrder(order)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Ver Detalles
          </Button>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              variant="outlined"
            >
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="preparing">Preparando</MenuItem>
              <MenuItem value="ready">Listo</MenuItem>
              <MenuItem value="delivered">Entregado</MenuItem>
              <MenuItem value="paid">Pagado</MenuItem>
            </Select>
          </FormControl>
        </CardActions>
      </Card>
    );
  };

  // Asegurar que orders sea un array antes de filtrar
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) : [];

  console.log('🔍 Estado actual de orders:', orders);
  console.log('🔍 Tipo de orders:', typeof orders);
  console.log('🔍 Es array orders:', Array.isArray(orders));
  console.log('🔍 Longitud de orders:', orders?.length);
  console.log('🔍 StatusFilter actual:', statusFilter);
  console.log('🔍 Órdenes filtradas:', filteredOrders);
  console.log('🔍 Cantidad de órdenes filtradas:', filteredOrders.length);

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Órdenes">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Gestión de Órdenes
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Administra las órdenes del restaurante
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualizar">
              <IconButton 
                color="primary" 
                onClick={loadData}
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
              onClick={handleOpenCreateDialog}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Nueva Orden
            </Button>
          </Stack>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={2.4}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.4)
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  <RestaurantIcon />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                  {stats.total}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Total Órdenes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.3)}`,
                  borderColor: alpha(theme.palette.warning.main, 0.4)
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: theme.palette.warning.main, mb: 2 }}>
                  <PendingIcon />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="warning.main" gutterBottom>
                  {stats.pending}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.3)}`,
                  borderColor: alpha(theme.palette.info.main, 0.4)
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: theme.palette.info.main, mb: 2 }}>
                  <KitchenIcon />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="info.main" gutterBottom>
                  {stats.preparing}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Preparando
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.3)}`,
                  borderColor: alpha(theme.palette.success.main, 0.4)
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: theme.palette.success.main, mb: 2 }}>
                  <CheckIcon />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="success.main" gutterBottom>
                  {stats.ready}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Listas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  borderColor: alpha(theme.palette.secondary.main, 0.4)
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: theme.palette.secondary.main, mb: 2 }}>
                  <MoneyIcon />
                </Box>
                <Typography variant="h3" fontWeight="bold" color="secondary.main" gutterBottom>
                  ${(stats.totalRevenue || 0).toFixed(0)}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Ingresos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            mb: 3
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Filtros de Órdenes
            </Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrar por Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todas las Órdenes</MenuItem>
                <MenuItem value="pending">Pendientes</MenuItem>
                <MenuItem value="preparing">Preparando</MenuItem>
                <MenuItem value="ready">Listas</MenuItem>
                <MenuItem value="delivered">Entregadas</MenuItem>
                <MenuItem value="paid">Pagadas</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Estado de Mesas */}
        {Array.isArray(tables) && tables.length > 0 && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              mb: 3
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TableIcon color="primary" />
              Estado de las Mesas
            </Typography>
            <Grid container spacing={2}>
              {tables.map((table) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={table.id}>
                  <Paper
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: `2px solid ${alpha(
                        table.status === 'occupied' ? theme.palette.error.main :
                        table.status === 'reserved' ? theme.palette.warning.main :
                        theme.palette.success.main, 0.3
                      )}`,
                      bgcolor: alpha(
                        table.status === 'occupied' ? theme.palette.error.main :
                        table.status === 'reserved' ? theme.palette.warning.main :
                        theme.palette.success.main, 0.1
                      ),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: theme.shadows[3],
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Mesa {table.number}
                    </Typography>
                    <Chip 
                      label={getTableStatusText(table)} 
                      color={getTableStatusColor(table)}
                      size="small"
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Typography variant="caption" display="block">
                      <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      Capacidad: {table.capacity}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Órdenes */}
      <Grid container spacing={3}>
        {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
              <OrderCard order={order} />
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
              <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No hay órdenes disponibles
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                {statusFilter !== 'all' 
                  ? `No se encontraron órdenes con estado "${getStatusConfig(statusFilter).text}"`
                  : 'Crea una nueva orden para comenzar'
                }
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                Crear Primera Orden
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* FAB para agregar orden */}
      <Fab 
        color="primary" 
        aria-label="add"
        onClick={handleOpenCreateDialog}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
        }}
      >
        <AddIcon />
      </Fab>

      {/* Diálogo para crear nueva orden */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Crear Nueva Orden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona una mesa y agrega productos
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Selector de Mesa */}
            {loadingTables ? (
              <LoadingSelect label="Seleccionar Mesa" loading={true} />
            ) : (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Seleccionar Mesa</InputLabel>
                <Select
                  value={newOrder.tableNumber}
                  label="Seleccionar Mesa"
                  onChange={(e) => setNewOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                >
                  {Array.isArray(tables) && tables.length > 0 ? (
                    tables.map((table) => (
                      <MenuItem 
                        key={table.id} 
                        value={table.number}
                        disabled={table.status === 'occupied'}
                      >
                        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                          <span>Mesa {table.number} (Capacidad: {table.capacity})</span>
                          <Chip 
                            label={getTableStatusText(table)} 
                            color={getTableStatusColor(table)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography color="text.secondary">
                        No hay mesas disponibles
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Productos de la Orden
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                disabled={loadingProducts || products.length === 0}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Agregar Producto
              </Button>
            </Box>

            {newOrder.items.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {loadingProducts ? 'Cargando productos...' : 'Agrega productos a la orden para continuar'}
              </Alert>
            ) : (
              newOrder.items.map((item, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      {loadingProducts ? (
                        <LoadingSelect label="Producto" loading={true} />
                      ) : (
                        <FormControl fullWidth>
                          <InputLabel>Producto</InputLabel>
                          <Select
                            value={item.productId}
                            label="Producto"
                            onChange={(e) => handleProductChange(index, e.target.value)}
                          >
                            {Array.isArray(products) && products.length > 0 ? (
                              products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  {product.name} - ${(product.price || 0).toFixed(2)}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                <Typography color="text.secondary">
                                  No hay productos disponibles
                                </Typography>
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Cantidad"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        inputProps={{ min: 1 }}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveProduct(index)}
                        sx={{ border: '1px solid', borderColor: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            )}

            {newOrder.items.length > 0 && (
              <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                <Typography variant="h5" align="center" fontWeight="bold" color="primary">
                  Total de la Orden: ${(calculateTotal() || 0).toFixed(2)}
                </Typography>
              </Paper>
            )}

            {/* Botón para recargar datos si hay problemas */}
            {(tables.length === 0 || products.length === 0) && !loadingTables && !loadingProducts && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    if (tables.length === 0) loadTables();
                    if (products.length === 0) loadProducts();
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Recargar Datos
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseCreateDialog} size="large">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateOrder} 
            variant="contained"
            disabled={!newOrder.tableNumber || newOrder.items.length === 0 || loadingTables || loadingProducts}
            size="large"
            sx={{ px: 4, fontWeight: 600 }}
          >
            Crear Orden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles de orden */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Detalles de la Orden #{selectedOrder?.id}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <TableIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Mesa {selectedOrder.Table?.number || selectedOrder.tableNumber || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Chip 
                      label={getStatusConfig(selectedOrder.status).text} 
                      color={getStatusConfig(selectedOrder.status).color}
                      icon={getStatusConfig(selectedOrder.status).icon}
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Estado Actual
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="action" />
                Fecha: {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedOrder.OrderItems || selectedOrder.items || []).map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.Product?.name || item.productName || 'Producto no disponible'}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell align="right">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        ${selectedOrder.total?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="contained" size="large" sx={{ fontWeight: 600 }}>
            Cerrar
          </Button>
                </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Orders;
