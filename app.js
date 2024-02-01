// starting demo

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./util/database'); 
// const helmet= require('helmet');
 const morgan= require('morgan');
 const fs= require('fs');
 const path= require('path');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const premiumFeatureRoutes = require('./routes/premiumFeature')
const resetPasswordRoutes = require('./routes/resetpassword')


const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order')
const  Forgotpassword = require('./models/forgotpassword')
const  DownloadHistory = require('./models/DownloadHistory')


dotenv.config();              
const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Use your user routes
app.use('/',userRoutes)
app.use('/user', userRoutes);
app.use('/expense',expenseRoutes)
app.use('/purchase',purchaseRoutes)
app.use('/premium',premiumFeatureRoutes)
app.use('/password',resetPasswordRoutes)



User.hasMany(Expense)
Expense.belongsTo(User)

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User)

User.hasMany(DownloadHistory)
DownloadHistory.belongsTo(User)

const accessLogStream= fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'});
 app.use(morgan('combined',{stream: accessLogStream}));

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized');
  }) 
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
