const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las categorías
router.get('/', categoryController.getAllCategories);

// Obtener categoría por ID
router.get('/:id', categoryController.getCategoryById);

// Crear nueva categoría (admin y chef)
router.post('/', requireRole(['admin', 'chef']), categoryController.createCategory);

// Actualizar categoría (admin y chef)
router.put('/:id', requireRole(['admin', 'chef']), categoryController.updateCategory);

// Eliminar categoría (solo admin)
router.delete('/:id', requireRole(['admin']), categoryController.deleteCategory);

module.exports = router;