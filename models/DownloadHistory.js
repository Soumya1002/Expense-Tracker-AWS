const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const DownloadHistory = sequelize.define('download_history', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    file_url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    downloaded_at: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

module.exports = DownloadHistory;
