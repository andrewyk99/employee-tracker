const db = require('./config/connection');

db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
});