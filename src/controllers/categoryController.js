const { Category } = require('../models');

const categoryController = {
  // Obtener todas las categorías
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.findAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener categoría por ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }
      
      res.json({ success: true, data: category });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nueva categoría
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      const category = await Category.create({
        name,
        description
      });

      res.status(201).json({ success: true, data: category });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Actualizar categoría
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      await category.update({
        name: name || category.name,
        description: description || category.description
      });

      res.json({ success: true, data: category });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar categoría
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
      }

      await category.destroy();
      res.json({ success: true, message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = categoryController;