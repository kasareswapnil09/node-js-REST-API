if (process.env.NODE_ENV != 'Production') {
    require('dotenv').config()
}

var con = require("./connection");  //connection
var bodyParser = require('body-parser');  //body parser


const express = require ('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// const routes = require('./routes/routes');  //this is routing

const initializePassport = require('./passport-config')
initializePassport(passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
    )

const users = []


app.set('view-engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(bodyParser.json());


//This is for the starting the authentication with 
app.get('/',checkAuthenticated,(req,res) => {
    res.render('index.ejs', {name: req.user.username})
})

app.get('/login',checkNotAuthenticated,(req,res) => {
    res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))

app.get('/register',checkNotAuthenticated,(req,res) => {
    res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated,async(req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id:Date.now().toString(),
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword
        })
        res.redirect('/login')
    }catch{
        res.redirect('/register')
    }
    console.log(users)
})

/*-----------*/
app.post('/register',checkNotAuthenticated,function(req,res){
    //console.log(req.body);

    var username = req.body.username;
    var email = req.body.email;
    var mno = req.body.mno;
    var password = req.body.password;

    con.connect(function(error){
        if(error) throw error;

        //var sql = "INSERT INTO students(name,email,mno) VALUES('"+name+"','"+email+"','"+mno+"')";
        var sql = "INSERT INTO students2(username,email,mno,password) VALUES ?";

        var values = [
            [username,email,mno,password]
        ];


        con.query(sql,[values],function(error,result){
            if(error) throw error;
            //res.send('Student Register successfull'+result.insertId);
            res.redirect('/students2');
        });
    });

});

/*-----------------*/

/*-----router to get the data-----*/

// router.get('/register',checkNotAuthenticated,function(req,res,next){
//     res.render('sample_data',{title:'INSERT DATA INTO MYSQL', action:'submit'}
//     );
// })

// router.post('/register',checkNotAuthenticated,async,function(req,res,next){
//     var username = req.body.username;
//     var email = req.body.email;
//     var mno = req.body.mno;
//     var password = req.body.password;
//     var query = `INSERT INTO students2(username,email,mno,password)
//     VALUES("${username}","${email}","${mno}","${password}")`;

//     database.query(query,function(error,data){
//         if(error)
//         {
//             throw error;
//         }
//         else
//         {
//             res.redirect('/register');
//         }
//     });
// })

/*--------router the end the data paste--*/

app.delete('/logout',function(req,res,next) {
    req.logOut(function(err){
        if(err){return next(err);}
    })
    res.redirect('/login')
})



function checkAuthenticated(req,res,next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
//module.exports =router
app.listen(3000)