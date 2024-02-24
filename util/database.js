const Sequelize = require('sequelize')
const dotenv = require('dotenv')
dotenv.config()

const sequelize = new Sequelize('expense', 'root', 'Soumya*123', {
    dialect: 'mysql',
    host: 'localhost',
    logging: false
});

module.exports = sequelize;
