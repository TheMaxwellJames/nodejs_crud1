const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const { log } = require("console");



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

// Edit user route
router.get('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (!user) {
      // If the user is not found, redirect to the homepage or display an error page
      return res.redirect('/');
    }

    // Render the 'edit_users' template with the user data
    res.render('edit_users', {
      title: "Edit User",
      user: user,
    });
  } catch (err) {
    console.error('Error finding user:', err);
    res.redirect('/');
  }
});

//update user route

router.post('/update/:id', uplaod, async (req, res) => {
  try {
    const id = req.params.id;
    let new_image = '';

    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    } else {
      new_image = req.body.old_image;
    }

    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    req.session.message = {
      type: 'success',
      message: 'User Updated Successfully!',
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: 'danger' });
  }
});


//delete user route

router.get('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await User.findByIdAndRemove(id);

    if (result.image !== '') {
      try {
        fs.unlinkSync('./uploads/' + result.image);
      } catch (err) {
        console.log(err);
      }
    }

    req.session.message = {
      type: 'info',
      message: 'User Deleted Successfully'
    };
    res.redirect('/');
  } catch (err) {
    res.json({ message: err.message });
  }
});




module.exports = router;

