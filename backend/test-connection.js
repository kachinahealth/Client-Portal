console.log('Testing MongoDB connection...');
require('dotenv').config();
console.log('MongoDB URI found:', !!process.env.MONGODB_URI);
const mongoose = require('mongoose');
const uri = 'mongodb+srv://wildabeastteam:SAXxTCoV7KRVNVzO@cerevasc-stride-investi.fb7upaq.mongodb.net/stride-trial?retryWrites=true&w=majority&appName=cerevasc-stride-investigator-app';
mongoose.connect(uri).then(() => console.log('Connected to MongoDB!')).catch(err => console.error('Connection failed:', err.message));
