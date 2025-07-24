const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las mesas
router.get('/', tableController.getAllTables);

// Obtener mesa por ID
router.get('/:id', tableController.getTableById);

// Crear nueva mesa (admin)
router.post('/', requireRole(['admin']), tableController.createTable);

// Actualizar mesa (admin y waiter para cambiar estado)
router.put('/:id', tableController.updateTable);

// Eliminar mesa (solo admin)
router.delete('/:id', requireRole(['admin']), tableController.deleteTable);

module.exports = router;