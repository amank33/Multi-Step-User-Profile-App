
const Country = require('../model/country');

async function addDataCountry() {
    await Country.deleteMany({}); // Clear existing data
    await Country.insertMany([
        {
    name: 'India',
    states: [
      { name: 'Maharashtra', cities: [{ name: 'Mumbai' }, { name: 'Pune' }] },
      { name: 'Karnataka', cities: [{ name: 'Bangalore' }, { name: 'Mysore' }] }
    ]
  },
  {
    name: 'USA',
    states: [
      { name: 'California', cities: [{ name: 'Los Angeles' }, { name: 'San Francisco' }] },
      { name: 'Texas', cities: [{ name: 'Houston' }, { name: 'Dallas' }] }
    ]
  }
    ]);
    console.log("all data inserted");
}

module.exports=addDataCountry;