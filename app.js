
require('dotenv').config();
const express = require("express");
const app = express();
const session = require("express-session");
const nocache = require("nocache");
const ejs = require('ejs');

const PORT = process.env.PORT;
const LOGINUSER = process.env.LOGINUSER;
const PASSWORD = process.env.PASSWORD;
const SECRET = process.env.SECRET;
const ROLE = process.env.ROLE;

let letterSpace;
let invalid;
let unauth;


app.set('view engine', 'ejs');
app.use(express.static("public"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(nocache());


app.use(session({
    name: 'ameen.sid',
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: 600 }
}))


app.get('/', (req, res) => {
    if (req.session.admin && req.session.role == ROLE) {
        res.render("home");
    } else {
        res.redirect("/login");
    }
})


app.get('/login', (req, res) => {
    if (!req.session.admin) {
        if (letterSpace) {
            letterSpace = false;
            return res.render("login", { msg: "User name must be letter" })
        }
        if (invalid) {
            invalid = false;
            return res.render('login', { msg: "Invalid Credentials" })
        }
        if (unauth) {
            unauth = false;
            return res.render('login', { msg: "Unauthorized" });
        }
        res.render('login', { msg: null })
    } else {
        if (unauth) {
            unauth = false;
            return res.render('login', { msg: "Unauthorized" });
        }
        res.redirect('/');
    }

})


app.post("/verify", (req, res) => {
    if ((req.body.username).trim() == "" || /\d/.test(req.body.username)) {
        letterSpace = true;
        return res.redirect('/login')
    }

    if (req.body.username === LOGINUSER && req.body.password === PASSWORD) {
        req.session.admin = LOGINUSER;
        req.session.role = ROLE;
        unauth = false;
        return res.redirect('/')
    } else {
        invalid = true;
        return res.redirect('/login');
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('ameen.sid')
    res.redirect("/login");
})

app.use((req, res) => {
    res.status(404).render('error');
})

app.listen(PORT, () => {
    console.log("Server running on port ", PORT);
})
