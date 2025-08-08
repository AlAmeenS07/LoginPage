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

// setting view engine and static files

app.set('view engine' , 'ejs');
app.use(express.static("public"));

// middleware for understanding data

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.use(nocache());

// session handling middleware

app.use(session({
    secret : "secretKey",
    resave : false,
    saveUninitialized : true,
}))

// rendering route

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
        res.render("login" , {msg : null});
    }
})

app.get('/login', (req,res)=>{
    if(req.session.admin == LOGINUSER){
        res.redirect('/')
    }else{
        res.render('login',{ msg : null});
    }
})

// form validating route

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
    res.redirect("/");
})

// error handling middleware

app.use((req,res)=>{
    res.status(404).render('error');
})

app.listen(PORT , ()=>{
    console.log("Server running on port " , PORT);
})