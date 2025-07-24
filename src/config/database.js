const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };