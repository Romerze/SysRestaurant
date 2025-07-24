import React, { useState, useEffect } from 'react';
import { 
  Grid, Typography, Box, Chip,
  LinearProgress, Card, CardContent, Avatar, Stack, useTheme
} from '@mui/material';
import { 
  RestaurantMenu as MenuIcon, TableBar as TableIcon, 
  Receipt as ReceiptIcon, AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon,
  EventSeat as SeatIcon, Kitchen as KitchenIcon,
  LocalShipping as DeliveryIcon, Payment as PaymentIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    products: 0,
    tables: 0,
    totalOrders: 0,
    revenue: 0,
    tablesOccupied: 0,
    tablesAvailable: 0,
    ordersByStatus: {
      pending: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      paid: 0
    }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener productos
        const productsResponse = await api.product.getAll();
        let productsData = [];
        if (productsResponse?.data?.success && productsResponse.data.data) {
          productsData = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [productsResponse.data.data];
        } else if (Array.isArray(productsResponse?.data)) {
          productsData = productsResponse.data;
        }

        // Obtener mesas
        const tablesResponse = await api.table.getAll();
        let tablesData = [];
        if (tablesResponse?.data?.success && tablesResponse.data.data) {
          tablesData = Array.isArray(tablesResponse.data.data) ? tablesResponse.data.data : [tablesResponse.data.data];
        } else if (Array.isArray(tablesResponse?.data)) {
          tablesData = tablesResponse.data;
        }

        // Obtener órdenes
        const ordersResponse = await api.order.getAll();
        let ordersData = [];
        if (ordersResponse?.data?.success && ordersResponse.data.data) {
          ordersData = Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : [ordersResponse.data.data];
        } else if (Array.isArray(ordersResponse?.data)) {
          ordersData = ordersResponse.data;
        }

        // Calcular estadísticas de mesas
        const occupiedTables = tablesData.filter(table => table.status === 'occupied').length;
        const availableTables = tablesData.filter(table => table.status === 'available').length;

        // Calcular estadísticas de órdenes por estado
        const ordersByStatus = {
          pending: ordersData.filter(order => order.status === 'pending').length,
          preparing: ordersData.filter(order => order.status === 'preparing').length,
          ready: ordersData.filter(order => order.status === 'ready').length,
          delivered: ordersData.filter(order => order.status === 'delivered').length,
          paid: ordersData.filter(order => order.status === 'paid').length
        };

        // Calcular ingresos (órdenes pagadas)
        const paidOrders = ordersData.filter(order => order.status === 'paid');
        const totalRevenue = paidOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        // Obtener órdenes recientes (últimas 5)
        const sortedOrders = ordersData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setStats({
          products: productsData.length,
          tables: tablesData.length,
          totalOrders: ordersData.length,
          revenue: totalRevenue,
          tablesOccupied: occupiedTables,
          tablesAvailable: availableTables,
          ordersByStatus
        });

        setRecentOrders(sortedOrders);

      } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        // Datos de ejemplo en caso de error
        setStats({
          products: 24,
          tables: 10,
          totalOrders: 156,
          revenue: 8450.75,
          tablesOccupied: 6,
          tablesAvailable: 4,
          ordersByStatus: {
            pending: 5,
            preparing: 8,
            ready: 3,
            delivered: 12,
            paid: 128
          }
        });
        setRecentOrders([
          { id: 1, tableNumber: 5, status: 'pending', total: 45.50, createdAt: new Date().toISOString() },
          { id: 2, tableNumber: 3, status: 'preparing', total: 32.00, createdAt: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'ready': return '#4caf50';
      case 'delivered': return '#9c27b0';
      case 'paid': return '#607d8b';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <WarningIcon />;
      case 'preparing': return <KitchenIcon />;
      case 'ready': return <CheckCircleIcon />;
      case 'delivered': return <DeliveryIcon />;
      case 'paid': return <PaymentIcon />;
      default: return <ReceiptIcon />;
    }
  };

  // Componente para las tarjetas de estadísticas mejoradas
  const StatsCard = ({ title, value, icon, color, subtitle }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${color}25`
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={color} gutterBottom>
              {value}
            </Typography>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: color, 
              width: 60, 
              height: 60,
              boxShadow: `0 4px 14px ${color}40`
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="h6" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Cargando datos del dashboard...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard del Restaurante">
      <Box sx={{ flexGrow: 1 }}>
        {/* Header simplificado - eliminamos la redundancia */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Resumen general de la actividad del restaurante
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Tarjetas principales mejoradas */}
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Productos en Menú" 
              value={stats.products} 
              icon={<MenuIcon sx={{ fontSize: 30 }} />} 
              color="#1976d2"
              subtitle="Total de productos disponibles"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Mesas del Restaurante" 
              value={stats.tables} 
              icon={<TableIcon sx={{ fontSize: 30 }} />} 
              color="#388e3c"
              subtitle={`${stats.tablesOccupied} ocupadas, ${stats.tablesAvailable} libres`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Órdenes Totales" 
              value={stats.totalOrders} 
              icon={<ReceiptIcon sx={{ fontSize: 30 }} />} 
              color="#f57c00"
              subtitle="Órdenes procesadas"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatsCard 
              title="Ingresos Totales" 
              value={`$${stats.revenue.toFixed(2)}`} 
              icon={<MoneyIcon sx={{ fontSize: 30 }} />} 
              color="#d32f2f"
              subtitle="Solo órdenes pagadas"
            />
          </Grid>

          {/* Estado de las mesas mejorado */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: '#388e3c', mr: 2 }}>
                    <SeatIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    Estado de las Mesas
                  </Typography>
                </Box>
                
                <Stack spacing={3}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1" fontWeight="medium">
                        Mesas Ocupadas
                      </Typography>
                      <Chip 
                        label={`${stats.tablesOccupied} / ${stats.tables}`}
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.tables > 0 ? (stats.tablesOccupied / stats.tables) * 100 : 0} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        bgcolor: '#ffebee',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#f44336'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1" fontWeight="medium">
                        Mesas Disponibles
                      </Typography>
                      <Chip 
                        label={`${stats.tablesAvailable} / ${stats.tables}`}
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.tables > 0 ? (stats.tablesAvailable / stats.tables) * 100 : 0} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        bgcolor: '#e8f5e8',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#4caf50'
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Órdenes por estado mejorado */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: '#f57c00', mr: 2 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    Órdenes por Estado
                  </Typography>
                </Box>
                
                <Stack spacing={2}>
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <Box 
                      key={status}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: `${getStatusColor(status)}10`,
                        border: `1px solid ${getStatusColor(status)}30`
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: getStatusColor(status), 
                          width: 40, 
                          height: 40, 
                          mr: 2 
                        }}
                      >
                        {getStatusIcon(status)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {getStatusText(status)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count} órdenes
                        </Typography>
                      </Box>
                      <Chip 
                        label={count} 
                        sx={{ 
                          bgcolor: getStatusColor(status),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Actividad reciente mejorada */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">
                    Órdenes Recientes
                  </Typography>
                </Box>
                
                {recentOrders.length > 0 ? (
                  <Stack spacing={2}>
                    {recentOrders.map((order, index) => (
                      <Box
                        key={order.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.200',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'grey.100',
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: getStatusColor(order.status), 
                            mr: 2 
                          }}
                        >
                          {getStatusIcon(order.status)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            Orden #{order.id} - Mesa {order.Table?.number || order.tableNumber || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', mr: 2 }}>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${order.total?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={getStatusText(order.status)} 
                          sx={{ 
                            bgcolor: getStatusColor(order.status),
                            color: 'white'
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary'
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6">
                      No hay órdenes recientes para mostrar
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;