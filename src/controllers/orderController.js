const { Order, OrderItem, Product, Table, User } = require('../models');

const orderController = {
  // Obtener todas las órdenes
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: Table
          },
          {
            model: User,
            as: 'waiter',
            attributes: { exclude: ['password'] }
          },
          {
            model: OrderItem,
            include: [{
              model: Product
            }]
          }
        ]
      });
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener orden por ID
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
          {
            model: Table
          },
          {
            model: User,
            as: 'waiter',
            attributes: { exclude: ['password'] }
          },
          {
            model: OrderItem,
            include: [{
              model: Product
            }]
          }
        ]
      });
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }
      
      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error al obtener orden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nueva orden
  createOrder: async (req, res) => {
    try {
      const { tableId, items, notes } = req.body;
      const userId = req.user.id; // Del middleware de autenticación

      // Calcular total
      let total = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          total += product.price * item.quantity;
        }
      }

      // Crear orden
      const order = await Order.create({
        tableId,
        userId,
        total,
        status: 'pending',
        notes
      });

      // Crear items de la orden
      for (const item of items) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }

      // Obtener la orden completa con relaciones
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: Table
          },
          {
            model: User,
            as: 'waiter',
            attributes: { exclude: ['password'] }
          },
          {
            model: OrderItem,
            include: [{
              model: Product
            }]
          }
        ]
      });

      res.status(201).json({ success: true, data: completeOrder });
    } catch (error) {
      console.error('Error al crear orden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar orden
  updateOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      await order.update({
        status: status || order.status,
        notes: notes || order.notes
      });

      // Obtener la orden actualizada con relaciones
      const updatedOrder = await Order.findByPk(id, {
        include: [
          {
            model: Table
          },
          {
            model: User,
            as: 'waiter',
            attributes: { exclude: ['password'] }
          },
          {
            model: OrderItem,
            include: [{
              model: Product
            }]
          }
        ]
      });

      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar estado de orden
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      await order.update({ status });

      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Error al actualizar estado de orden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar orden
  deleteOrder: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      // Eliminar items de la orden primero
      await OrderItem.destroy({ where: { orderId: id } });
      
      // Eliminar la orden
      await order.destroy();
      
      res.json({ success: true, message: 'Orden eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar orden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = orderController;