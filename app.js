const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const  fs = require('fs')
const sequelize = require('./util/database'); 
const morgan = require('morgan');
const helmet = require('helmet')
const  compression = require(`compression`)


const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense')
const purchaseRoutes = require('./routes/purchase')
const premiumFeatureRoutes = require('./routes/premiumFeature')
const resetPasswordRoutes = require('./routes/resetpassword')


const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order')
const  Forgotpassword = require('./models/forgotpassword')


dotenv.config();              
const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
//app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}) );


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
