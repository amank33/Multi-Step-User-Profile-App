const User = require("../model/user");
const bcrypt = require("bcrypt");
const Country = require("../model/country");
const path = require("path");

class UserAPIsController {
  async getCountries(req, res) {
    try {
      const countries = await Country.find({});
      res.json(countries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  async updateProfile(req, res) {
    try {
      const data = req.body;
      //return res.json({ data });
      // File upload handled by middleware, set profilePhoto path
      if (req.file) {
        // Save only the relative path (e.g., /uploads/filename.jpg)
        const relPath = path.join('/uploads', path.basename(req.file.path));
        data.profilePhoto = relPath.replace(/\\/g, '/');
      }

      // Upsert user
      const user = await User.findOne({ username: data.username, isDeleted: false });
      if (user) {
        // Password update logic
        if (data.newPassword) {
          if (!data.currentPassword) {
            return res.status(400).json({ error: "Current password required" });
          }

          const match = await bcrypt.compare(
            data.currentPassword,
            user.password
          );
          if (!match)
            return res
              .status(400)
              .json({ error: "Current password incorrect" });
          data.password = await bcrypt.hash(data.newPassword, 10);
        }
        // Remove newPassword/currentPassword from data
        delete data.newPassword;
        delete data.currentPassword;

        const updatedUser = await User.findOneAndUpdate(
          { username: data.username,isDeleted: false },          
          { $set: data },
          { new: true, upsert: true }
        );
        res.json({ success: true, updatedUser, new: false });
      } else {//if new user
        if (data.newPassword) {
          data.password = await bcrypt.hash(data.newPassword, 10);
        }
        // Remove newPassword/currentPassword from data
        delete data.newPassword;
        delete data.currentPassword;

        const newUser = new User(data);
        await newUser.save();
        res.json({ success: true, newUser, new: true });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async checkUsername(req, res) {
    const { username } = req.query;
    if (!username) return res.json({ available: false });
    const exists = await User.exists({ username, isDeleted: false });
    res.json({ available: !exists });
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.find({ isDeleted: false });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new UserAPIsController();
