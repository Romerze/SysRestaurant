const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los productos
router.get('/', productController.getAllProducts);

// Obtener producto por ID
router.get('/:id', productController.getProductById);

// Crear nuevo producto (admin y chef) con imagen opcional
router.post('/', requireRole(['admin', 'chef']), upload.single('image'), productController.createProduct);

// Actualizar producto (admin y chef) con imagen opcional
router.put('/:id', requireRole(['admin', 'chef']), upload.single('image'), productController.updateProduct);

// Eliminar producto (solo admin)
router.delete('/:id', requireRole(['admin']), productController.deleteProduct);

module.exports = router;