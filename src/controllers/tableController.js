const { Table } = require('../models');

const tableController = {
  // Obtener todas las mesas
  getAllTables: async (req, res) => {
    try {
      const tables = await Table.findAll();
      res.json({ success: true, data: tables });
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener mesa por ID
  getTableById: async (req, res) => {
    try {
      const { id } = req.params;
      const table = await Table.findByPk(id);
      
      if (!table) {
        return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
      }
      
      res.json({ success: true, data: table });
    } catch (error) {
      console.error('Error al obtener mesa:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nueva mesa
  createTable: async (req, res) => {
    try {
      const { number, capacity, status } = req.body;

      // Verificar si ya existe una mesa con ese número
      const existingTable = await Table.findOne({ where: { number } });
      if (existingTable) {
        return res.status(400).json({ success: false, message: 'Ya existe una mesa con ese número' });
      }

      const table = await Table.create({
        number,
        capacity,
        status: status || 'free'
      });

      res.status(201).json({ success: true, data: table });
    } catch (error) {
      console.error('Error al crear mesa:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar mesa
  updateTable: async (req, res) => {
    try {
      const { id } = req.params;
      const { number, capacity, status } = req.body;

      const table = await Table.findByPk(id);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
      }

      // Si se está actualizando el número, verificar que no exista
      if (number && number !== table.number) {
        const existingTable = await Table.findOne({ where: { number } });
        if (existingTable) {
          return res.status(400).json({ success: false, message: 'Ya existe una mesa con ese número' });
        }
      }

      await table.update({
        number: number || table.number,
        capacity: capacity || table.capacity,
        status: status || table.status
      });

      res.json({ success: true, data: table });
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar mesa
  deleteTable: async (req, res) => {
    try {
      const { id } = req.params;

      const table = await Table.findByPk(id);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
      }

      await table.destroy();
      res.json({ success: true, message: 'Mesa eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = tableController;