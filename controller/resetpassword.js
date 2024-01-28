const uuid = require("uuid");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const dotenv =require("dotenv");
dotenv.config()
const User = require("../models/user");
const Forgotpassword = require("../models/forgotpassword");

const defaultClient = Sib.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const forgetPassPage = async (req, res) => {
  res.sendFile("forgetpass.html", { root: "public/views" });
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      const id = uuid.v4();
      user.createForgotpassword({ id, active: true }).catch((err) => {
        throw new Error(err);
      });

      const client = Sib.ApiClient.instance;
      const apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

      const sender = {
        email: "MoneyManiacexpense@gmail.com",
        name: "Expense Tracker - Admin",
      };

      const recievers = [
        {
          email: email,
        },
      ];
      const transactionalEmailApi = new Sib.TransactionalEmailsApi();
      transactionalEmailApi
        .sendTransacEmail({
          subject: "Reset Password Mail",
          sender,
          to: recievers,
          htmlContent: `
                        <h1>Kindly reset the password through below link...</h1>
                        <a href="${process.env.WEBSITE}/password/resetpassword/${id}">Reset password</a>
                    `,
        })        
          return res.status(200).json({
            success: true,
            message: "reset password link has been sent to your email",
          });      
    } 
    else {
      console.log("user doesnt exists");
      // If the email doesn't exist
      return res.status(400).json({
        success: false,
        message: "User doesn't exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error, success: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    const id = req.params.id;
    Forgotpassword.findOne({ where: { id } }).then((forgotpasswordrequest) => {
      if (forgotpasswordrequest) {
        if (forgotpasswordrequest.active === true) {
          forgotpasswordrequest.update({ active: false });
          res.status(200).send(`<html>
          <link rel="stylesheet" href="/css/login.css"> 
                                <script>
                                    function formsubmitted(e){
                                            e.preventDefault();
                                                console.log('called')
                                    }
                                </script>
                                    <form action="${process.env.WEBSITE}/password/updatepassword/${id}" method="get" style="align-items: center;>
                                            <label for="newpassword" style="color: white;">Enter New password</label>
                                             <input name="newpassword" type="password" required></input>
                                             <button>reset password</button>
                                     </form>
                            </html>`);
          res.end();
        } else {
          throw new Error("request has expired");
        }
      } else {
        throw new Error("request not found");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = (req, res) => {
  try {
    const { newpassword } = req.query;
    const resetpasswordid = req.params.id;
    Forgotpassword.findOne({ where: { id: resetpasswordid } }).then(
      (resetpasswordrequest) => {
        User.findOne({ where: { id: resetpasswordrequest.userId } }).then(
          (user) => {
            // console.log('userDetails', user)
            if (user) {
              //encrypt the password
              const saltRounds = 10;
              bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                  console.log(err);
                  throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, function (err, hash) {
                  // Store hash in your password DB.
                  if (err) {
                    console.log(err);
                    throw new Error(err);
                  }
                  user.update({ password: hash }).then(() => {
                    res
                      .status(201)
                      .json({
                        message: "Successfuly updated the new password",
                      });
                  });
                });
              });
            } else {
              return res
                .status(404)
                .json({ error: "No user Exists", success: false });
            }
          }
        );
      }
    );
  } catch (error) {
    return res.status(403).json({ error, success: false });
  }
};

module.exports = {
  forgetPassPage,
  forgotPassword,
  resetPassword,
  updatePassword,
};
