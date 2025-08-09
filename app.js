
require('dotenv').config();
const express = require("express");
const app = express();
const session = require("express-session");
const nocache = require("nocache");
const ejs = require('ejs');

// env variables

const PORT = process.env.PORT;
const LOGINUSER = process.env.LOGINUSER;
const PASSWORD = process.env.PASSWORD;
const SECRET = process.env.SECRET;

// setting view engine and static files

app.set('view engine' , 'ejs');
app.use(express.static("public"));

// middleware for understanding data

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

// no cache middleware

app.use(nocache());

// session handling middleware

app.use(session({
    name: 'ameen.sid',
    secret : SECRET,
    resave : false,
    saveUninitialized : false,
    // cookie : { maxAge : 5000 }
}))

// rendering route - home

app.get('/' , (req,res)=>{
    if(req.session.admin == LOGINUSER){
        res.render("home");
    }else{
        if(req.session.letterSpace){
            req.session.letterSpace = false;
            return res.render("login" , { msg : "User name must be letter"})
        }
        if(req.session.invalid){
            req.session.invalid = false;
            return res.render('login' , { msg : "Invalid Credentials"})
        }
        res.redirect("/login");
    }
})

// rendering route - login

app.get('/login', (req,res)=>{
    if(!req.session.admin){
        res.render('login',{ msg : null});
    }else{
        res.redirect('/')
    }
})

// form validating route - post

app.post("/verify" , (req,res)=>{
    if((req.body.username).trim() == "" || /\d/.test(req.body.username)){
        req.session.letterSpace = true;
        return res.redirect('/')
    }
    if(req.body.username != LOGINUSER || req.body.password != PASSWORD){
        req.session.invalid = true;
        return res.redirect('/');
    }

    if(req.body.username === LOGINUSER && req.body.password === PASSWORD){
        req.session.admin = LOGINUSER;
        return res.redirect('/')
    }
})

// logout route

app.post('/logout' , (req,res)=>{
    req.session.destroy();
    res.clearCookie('ameen.sid')
    res.redirect("/login");
})

// error page handling middleware

app.use((req,res)=>{
    res.status(404).render('error');
})

app.listen(PORT , ()=>{
    console.log("Server running on port " , PORT);
})

