const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

//image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var uplaod = multer({
    storage: storage,
}).single('image');

//insert a user into database route


// Assuming you have already defined your mongoose model somewhere, like this:
// const User = mongoose.model('User', userSchema);

router.post("/add", uplaod, async (req, res) => {
    try {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
      });
  
      await user.save(); // Use await to wait for the save() operation to complete
  
      req.session.message = {
        type: 'success',
        message: 'User added successfully'
      };
      res.redirect('/');
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  });
  



//Get all users route

router.get("/", async (req, res) => {
    try {
      // Assuming you have your User model imported and defined correctly
      const users = await User.find().exec(); // Use exec() to handle the Promise
  
      res.render("index", { title: "Home", users: users }); // Pass the users data to the view
    } catch (err) {
      res.json({ message: err.message, type: "danger" });
    }
  });
  


router.get("/add", (req, res) => {

 res.render('add_users', { title: "Add Users" });
});

module.exports = router;

