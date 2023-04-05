const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const fs = require("fs");

//image upload
var storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });
        await user.save();
        req.session.message = {
            type: "success",
            message: "User added successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', {title:"Home Page", users});
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


router.get("/add", async (req, res) => {
    res.render('add_users', {title:"Add users"});
});

router.get("/edit/:id", async(req, res) =>{
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();
        if (!user) {
            res.redirect("/");
        } else {
            res.render("edit_users", {
                title: "Edit Users",
                user: user,
            });
        }
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

router.post("/update/:id", upload, async (req, res) => {
    const id = req.params.id;
    let new_image = req.body.old_image;
  
    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync("./uploads/" + req.body.old_image);
      } catch (err) {
        console.log(err);
      }
    }
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          image: new_image,
        },
        { new: true } // returns the updated user document
      );
      req.session.message = {
        type: "success",
        message: "User updated successfully!",
      };
      res.redirect("/");
    } catch (err) {
      res.json({ message: err.message, type: "danger" });
    }
  });
  


module.exports = router;