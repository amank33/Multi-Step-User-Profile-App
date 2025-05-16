const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv').config();
const dbcon = require('./app/config/dbcon');
const cors = require('cors');

dbcon();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Only adding this for first time
// const addDataCountry=require('./app/helper/addDataCountry')
// addDataCountry()

const userRouter = require('./app/router/UserAPIsRouter');
app.use('/api/users', userRouter);


// app.use('/api/bookings', require('./app/router/BookingAPIsRouter'));


const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});

