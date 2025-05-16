const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { _id: false });

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cities: [citySchema]
}, { _id: false });

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  states: [stateSchema]
});

module.exports = mongoose.model('Country', countrySchema);
