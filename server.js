const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')


const app = express()

//bodyparser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//db config
const db = require('./config/keys').mongoURI;
//mongodb database connection
mongoose
    .connect(db,{ useNewUrlParser: true,useUnifiedTopology: true })
    .then(()=>console.log("Mongodb connection established"))
    .catch(err => console.log(err))

//passport middleware
app.use(passport.initialize())

//passport config
require('./config/passport')(passport);

//use routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);

//listen port
const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log(`Server is running on port ${port}`))