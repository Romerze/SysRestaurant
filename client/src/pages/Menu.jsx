import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Fab,
  Tooltip,
  alpha,
  useTheme,
  LinearProgress,
  Stack,
  Badge
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, 
  PhotoCamera as PhotoCameraIcon, RestaurantMenu as MenuIcon,
  AttachMoney as MoneyIcon, Category as CategoryIcon,
  Search as SearchIcon, FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

const Menu = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.product.getAll();
      let productsData = [];
      if (response && response.data) {
        if (response.data.data) {
          productsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          productsData = response.data;
        }
      }
      
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar productos: ' + error.message);
      // Datos de ejemplo
      setProducts([
        {
          id: 1,
          name: 'Pizza Margherita',
          description: 'Pizza clásica con tomate, mozzarella y albahaca fresca',
          price: 15.99,
          categoryId: 1,
          Category: { name: 'Platos Principales' },
          imageUrl: null
        },
        {
          id: 2,
          name: 'Ensalada César',
          description: 'Lechuga romana, crutones, parmesano y aderezo césar',
          price: 8.50,
          categoryId: 2,
          Category: { name: 'Ensaladas' },
          imageUrl: null
        },
        {
          id: 3,
          name: 'Tiramisu',
          description: 'Postre italiano con café, mascarpone y cacao',
          price: 6.99,
          categoryId: 3,
          Category: { name: 'Postres' },
          imageUrl: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.category.getAll();
      let categoriesData = [];
      if (response && response.data) {
        if (response.data.data) {
          categoriesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        }
      }
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([
        { id: 1, name: 'Platos Principales' },
        { id: 2, name: 'Ensaladas' },
        { id: 3, name: 'Postres' },
        { id: 4, name: 'Bebidas' },
        { id: 5, name: 'Entradas' }
      ]);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setCurrentProduct({
        ...product,
        categoryId: product.categoryId || product.Category?.id || '',
        image: null
      });
      setImagePreview(product.imageUrl || null);
      setIsEditing(true);
    } else {
      setCurrentProduct({
        name: '',
        description: '',
        price: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        image: null
      });
      setImagePreview(null);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentProduct({
        ...currentProduct,
        image: file
      });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentProduct.name || !currentProduct.price || !currentProduct.categoryId) {
        alert('Por favor, completa todos los campos requeridos (Nombre, Precio y Categoría)');
        return;
      }

      const formData = new FormData();
      formData.append('name', currentProduct.name.trim());
      formData.append('description', currentProduct.description?.trim() || '');
      formData.append('price', parseFloat(currentProduct.price));
      formData.append('categoryId', parseInt(currentProduct.categoryId));
      
      if (currentProduct.image) {
        formData.append('image', currentProduct.image);
      }

      let response;
      if (isEditing) {
        response = await api.product.update(currentProduct.id, formData);
      } else {
        response = await api.product.create(formData);
      }
      
      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await api.product.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto: ' + error.message);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || 
                           product.categoryId === parseInt(selectedCategory) ||
                           product.Category?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStats = () => {
    const total = products.length;
    const byCategory = categories.map(cat => ({
      ...cat,
      count: products.filter(p => p.categoryId === cat.id || p.Category?.id === cat.id).length
    }));
    const avgPrice = products.length > 0 ? 
      products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / products.length : 0;
    
    return { total, byCategory, avgPrice };
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

  const ProductCard = ({ product }) => {
    const categoryName = product.Category?.name || 
                        categories.find(c => c.id === product.categoryId)?.name || 
                        'Sin categoría';
    
    return (
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
        <CardMedia
          sx={{ 
            height: 200, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          image={product.imageUrl}
        >
          {!product.imageUrl && (
            <MenuIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          )}
        </CardMedia>
        
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>
            <Chip 
              label={`$${parseFloat(product.price || 0).toFixed(2)}`}
              color="primary"
              sx={{ fontWeight: 600, fontSize: '0.9rem' }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 40 }}>
            {product.description || 'Sin descripción'}
          </Typography>
          
          <Chip 
            label={categoryName}
            size="small"
            variant="outlined"
            color="secondary"
          />
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              ${parseFloat(product.price || 0).toFixed(2)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Editar">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleOpenDialog(product)}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleDelete(product.id)}
                sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                }}
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
      <Layout title="Gestión de Menú">
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="h6" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
            Cargando menú...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Menú">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Gestión de Menú
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Administra los productos y categorías de tu restaurante
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualizar">
              <IconButton 
                color="primary" 
                onClick={loadProducts}
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
              Nuevo Producto
            </Button>
          </Stack>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={4}>
            <StatsCard 
              title="Total de Productos" 
              value={stats.total} 
              color={theme.palette.primary.main}
              icon={<MenuIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <StatsCard 
              title="Categorías" 
              value={categories.length} 
              color={theme.palette.secondary.main}
              icon={<CategoryIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <StatsCard 
              title="Precio Promedio" 
              value={`$${stats.avgPrice.toFixed(2)}`} 
              color={theme.palette.success.main}
              icon={<MoneyIcon />}
            />
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Filtrar por categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box display="flex" justifyContent="space-between" width="100%">
                        <span>{category.name}</span>
                        <Badge 
                          badgeContent={stats.byCategory.find(c => c.id === category.id)?.count || 0}
                          color="primary"
                        />
                      </Box>
                    </MenuItem>
                  ))}
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
                  setSelectedCategory('');
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
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Productos */}
      <Grid container spacing={3}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
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
              <MenuIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {searchTerm || selectedCategory ? 'No se encontraron productos' : 'No hay productos en el menú'}
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                {searchTerm || selectedCategory ? 
                  'Intenta cambiar los filtros de búsqueda' : 
                  'Crea tu primer producto para comenzar a gestionar tu menú'
                }
              </Typography>
              {!searchTerm && !selectedCategory && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Crear Primer Producto
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

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
        <AddIcon />
      </Fab>

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? 'Modifica los datos del producto' : 'Ingresa los datos del nuevo producto'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                fullWidth
                label="Nombre del producto"
                name="name"
                value={currentProduct.name}
                onChange={handleInputChange}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={currentProduct.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Precio"
                name="price"
                type="number"
                value={currentProduct.price}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
                sx={{ mb: 3 }}
              />
              
              <FormControl fullWidth required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="categoryId"
                  value={currentProduct.categoryId}
                  label="Categoría"
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Imagen del producto
                </Typography>
                
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 200, 
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!imagePreview && (
                    <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  )}
                </Box>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    fullWidth
                  >
                    {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                  </Button>
                </label>
              </Box>
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

export default Menu;