const express = require('express');
const UserAPIsController = require('../controller/UserAPIsController');
const upload=require('../helper/imageUpload')
const router = express.Router();

// router.get('/', function (req, res) {
//     res.send('Hello Aman!')
// })

// Profile update (multi-step form final submit)
router.post('/user/profile', upload.single('profilePhoto'), UserAPIsController.updateProfile);

// Username check
router.get('/user/check-username', UserAPIsController.checkUsername);

// Get countries/states/cities
router.get('/user/countries', UserAPIsController.getCountries);

// Get all users (for dashboard)
router.get('/user/all', UserAPIsController.getAllUsers);

// Delete user (set isDeleted=true)
router.patch('/user/delete/:id', UserAPIsController.deleteUser);

module.exports = router;
