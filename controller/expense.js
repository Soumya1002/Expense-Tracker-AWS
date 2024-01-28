const Expense = require('../models/expense');
const User = require('../models/user'); 
const sequelize = require('../util/database')
const AWS = require('aws-sdk')
const dotenv = require("dotenv");
dotenv.config();

const indexPage = async (req, res) => {
    //console.log("indexPage")
    res.sendFile('index.html', { root: 'public/views' });
  };

  const addexpense =async (req, res) => {
    const t = await sequelize.transaction()
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0 ){
        return res.status(400).json({success: false, message: 'Parameters missing'})
    }
    try {
        const expense = await Expense.create({ expenseamount, description, category, userId: req.user.id },{transaction: t});
        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount);

        await User.update({ totalExpenses: totalExpense }, {
            where: { id: req.user.id },
            transaction: t
        });
        await t.commit()
        return res.status(201).json({ expense, success: true });
    } catch(err) {
        await t.rollback()
        return res.status(500).json({ success: false, error: err });
    }
}

const getexpenses = async (req, res)=> {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // Fetch expenses for the current page
        const expenses = await Expense.findAndCountAll({
            where: { userId: req.user.id },
            limit: limit,
            offset: offset
        });

        // Calculate total pages
        const totalExpenses = expenses.count;
        const totalPages = Math.ceil(totalExpenses / limit);

        // Send the response
        return res.status(200).json({
            expenses: expenses.rows || [],
            success: true,
            totalPages: totalPages
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message, success: false });
    }
}

const deleteExpense = async (req,res)=>{
   const expenseid = req.params.expenseid
   if(expenseid === undefined || expenseid.length ===0 ){
    return res.status(400).json({ success: false})
   }
//    console.log(expenseid)
   try {
    // Retrieve the expense amount before deleting
    const expense = await Expense.findByPk(expenseid);
    const expenseAmount = expense.expenseamount;

    // Delete the expense
    const noOfRows = await Expense.destroy({ where: { id: expenseid, userId: req.user.id } });

    if (noOfRows === 0) {
        return res.status(404).json({ success: false, message: 'Expense doesn\'t belong to the user' });
    }

    // Deduct the deleted expense amount from user's totalExpense
    const updatedTotalExpense = Number(req.user.totalExpenses) - Number(expenseAmount);
    
    // Update the user's totalExpense
    await User.update({ totalExpenses: updatedTotalExpense }, { where: { id: req.user.id } });

    return res.status(200).json({ success: true, message: 'Deleted Successfully' });
   }catch(err){
   console.log(err)
   return res.status(403).json({ success: false, message: 'Failed'})
   }
}

function uploadToS3(data , filename){
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.AWS_ACCESS_KEY_ID;
    const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        //Bucket: BUCKET_NAME
    })
        var params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'
        }
        return new Promise((resolve,reject)=>{
            s3bucket.upload(params, (err, s3response)=>{
                if(err){
                    console.log("something went wrong",err)
                    reject(err)
                }else{
                    console.log("success" , s3response)
                   // return res.status(200).json({fileURL , succes: true})
                   resolve(s3response.Location)
                }
            })
        })       
}

const downloadExpenses = async(req,res)=>{
    //console.log(req)
   try {
   // console.log(req.user)
      const expenses =await req.user.getExpenses()
    //   console.log(expenses)
    const stringifiedExpenses = JSON.stringify(expenses)
    const userId= req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`
    const fileURL = await uploadToS3(stringifiedExpenses, filename)
    res.status(200).json({ fileURL, success: true})
   } catch(error){
    console.log(error)
   }
}

module.exports = {
    indexPage,
    addexpense,
    getexpenses,
    deleteExpense,
    downloadExpenses
}