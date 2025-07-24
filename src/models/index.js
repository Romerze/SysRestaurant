const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Definición de modelos
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'waiter', 'chef', 'cashier'),
    defaultValue: 'waiter'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('free', 'occupied', 'reserved'),
    defaultValue: 'free'
  }
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'ready', 'delivered', 'paid', 'cancelled'),
    defaultValue: 'pending'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  }
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  }
});

// Definir relaciones con claves foráneas específicas
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Table.hasMany(Order, { foreignKey: 'tableId' });
Order.belongsTo(Table, { foreignKey: 'tableId' });

User.hasMany(Order, { foreignKey: 'waiterId' });
Order.belongsTo(User, { as: 'waiter', foreignKey: 'waiterId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Exportar modelos
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Table,
  Order,
  OrderItem
};