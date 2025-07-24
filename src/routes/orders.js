const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las órdenes
router.get('/', orderController.getAllOrders);

// Obtener orden por ID
router.get('/:id', orderController.getOrderById);

// Crear nueva orden
router.post('/', orderController.createOrder);

// Actualizar orden
router.put('/:id', orderController.updateOrder);

// Actualizar estado de orden
router.patch('/:id/status', orderController.updateOrderStatus);

// Eliminar orden (solo admin)
router.delete('/:id', requireRole(['admin']), orderController.deleteOrder);

module.exports = router;