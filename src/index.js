const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/orders', require('./routes/orders'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema de Restaurante funcionando correctamente' });
});

// Función para crear usuario administrador por defecto
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        fullName: 'Administrador del Sistema',
        password: hashedPassword,
        role: 'admin',
        active: true
      });
      console.log('✅ Usuario administrador creado exitosamente');
    }
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
  }
};

// Función para crear categorías por defecto
const createDefaultCategories = async () => {
  try {
    const { Category } = require('./models');
    const categoriesCount = await Category.count();
    
    if (categoriesCount === 0) {
      await Category.bulkCreate([
        { name: 'Entradas', description: 'Platos de entrada y aperitivos' },
        { name: 'Platos Principales', description: 'Platos principales del menú' },
        { name: 'Postres', description: 'Postres y dulces' },
        { name: 'Bebidas', description: 'Bebidas frías y calientes' },
        { name: 'Ensaladas', description: 'Ensaladas frescas y saludables' }
      ]);
      console.log('✅ Categorías por defecto creadas exitosamente');
    }
  } catch (error) {
    console.error('❌ Error al crear categorías por defecto:', error);
  }
};

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sincronizar modelos (FORZAR RECREACIÓN TEMPORAL)
    await sequelize.sync({ force: true });
    console.log('✅ Modelos sincronizados con la base de datos (tablas recreadas).');

    // Crear datos por defecto
    await createDefaultAdmin();
    await createDefaultCategories();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Frontend URL: http://localhost:3000`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log('\n📋 Credenciales de administrador:');
      console.log('   Usuario: admin');
      console.log('   Contraseña: admin123');
      console.log('\n🎯 El sistema está listo para usar!');
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
  }
};

startServer();