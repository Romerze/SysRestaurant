const { Product, Category } = require('../models');
const path = require('path');
const fs = require('fs');

const productController = {
  // Obtener todos los productos
  getAllProducts: async (req, res) => {
    try {
      console.log('Obteniendo todos los productos...');
      const products = await Product.findAll({
        include: [{
          model: Category
        }]
      });
      
      // Agregar URL completa de la imagen
      const productsWithImageUrl = products.map(product => {
        const productData = product.toJSON();
        if (productData.image) {
          productData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${productData.image}`;
        }
        return productData;
      });
      
      console.log(`Se encontraron ${products.length} productos`);
      res.json({ success: true, data: productsWithImageUrl });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Obtener producto por ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id, {
        include: [{
          model: Category
        }]
      });
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      
      const productData = product.toJSON();
      if (productData.image) {
        productData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${productData.image}`;
      }
      
      res.json({ success: true, data: productData });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Crear nuevo producto
  createProduct: async (req, res) => {
    try {
      const { name, description, price, categoryId } = req.body;
      const image = req.file ? req.file.filename : null;
      
      console.log('Creando producto:', { name, description, price, categoryId, image });

      // Validar que la categoría existe
      const category = await Category.findByPk(categoryId);
      if (!category) {
        // Si hay imagen subida pero falla la validación, eliminar el archivo
        if (image) {
          const imagePath = path.join(__dirname, '../../uploads/products', image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        return res.status(400).json({ success: false, message: 'Categoría no encontrada' });
      }

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        image: image
      });

      console.log('Producto creado con ID:', product.id);

      // Obtener el producto con la categoría incluida
      const productWithCategory = await Product.findByPk(product.id, {
        include: [{
          model: Category
        }]
      });

      const productData = productWithCategory.toJSON();
      if (productData.image) {
        productData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${productData.image}`;
      }

      res.status(201).json({ success: true, data: productData });
    } catch (error) {
      console.error('Error al crear producto:', error);
      
      // Si hay error y se subió una imagen, eliminarla
      if (req.file) {
        const imagePath = path.join(__dirname, '../../uploads/products', req.file.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  },

  // Actualizar producto
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId } = req.body;
      const newImage = req.file ? req.file.filename : null;

      const product = await Product.findByPk(id);
      if (!product) {
        // Si hay imagen nueva pero el producto no existe, eliminar el archivo
        if (newImage) {
          const imagePath = path.join(__dirname, '../../uploads/products', newImage);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      // Validar que la categoría existe si se está actualizando
      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          if (newImage) {
            const imagePath = path.join(__dirname, '../../uploads/products', newImage);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
          return res.status(400).json({ success: false, message: 'Categoría no encontrada' });
        }
      }

      // Si hay nueva imagen, eliminar la anterior
      if (newImage && product.image) {
        const oldImagePath = path.join(__dirname, '../../uploads/products', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      await product.update({
        name: name || product.name,
        description: description || product.description,
        price: price ? parseFloat(price) : product.price,
        categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
        image: newImage || product.image
      });

      // Obtener el producto actualizado con la categoría incluida
      const updatedProduct = await Product.findByPk(id, {
        include: [{
          model: Category
        }]
      });

      const productData = updatedProduct.toJSON();
      if (productData.image) {
        productData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${productData.image}`;
      }

      res.json({ success: true, data: productData });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      
      // Si hay error y se subió una imagen nueva, eliminarla
      if (req.file) {
        const imagePath = path.join(__dirname, '../../uploads/products', req.file.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  },

  // Eliminar producto
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      // Eliminar imagen si existe
      if (product.image) {
        const imagePath = path.join(__dirname, '../../uploads/products', product.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await product.destroy();
      console.log('Producto eliminado con ID:', id);
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
};

module.exports = productController;