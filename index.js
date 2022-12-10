const express = require('express');
const app = express()
const bodyparser = require('body-parser')
const Sequelize = require('sequelize')
const port = 4500

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}))


const sequelize = new Sequelize('bitthaldb','Bitthal','Bitthal@123', {
    dialect: "mysql",
});

// schema for new user 

const reg_frm = sequelize.define('req_table', {
    name: {
       type: Sequelize.STRING,
       allowNull: false,
    },
    contact: {
        type: Sequelize.INTEGER,
        unique: true,
    },
    email: Sequelize.STRING,
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
},{tableName: "reg_frm"});

reg_frm.sync();


// schema for spam users 

const spam_frm = sequelize.define('spam_table', {
    contct: {
      type: Sequelize.INTEGER, 
      allowNull: false,
      unique: true,
    } 
},{tableName: "spam_frm"});

spam_frm.sync();


sequelize.authenticate().then(()=>{
    console.log('connection successful')
}).catch((err) =>{
     console.log(err,'this has error');
})

/*app.get("/" , (req,res) =>{
    res.send("Working Good");
})*/

app.post('/' ,async(req,res) =>{
    const name = req.body.name;
    const contact = req.body.contact;
    const email = req.body.email;
    const password = req.body.password;
    const saveData = reg_frm.build({
         name,
         contact,
         email,
         password,
    });
    await saveData.save();
    res.send('data send successfully');
});

// to get all users with registered number and password

app.get('/' , async(req,res) =>{
    const allData = await reg_frm.findAll();
    res.json(allData)
})

// To get all users with the required phone no.

app.get("/contact/:contact" , async(req,res) =>{
    const reqcon = req.params.contact;
    const data = await reg_frm.findOne({
        where:{
            contact: reqcon
        }
    }).then(function(data){
        if(!data){
            res.send('not find');
        }
        res.json(data);
    })
})

// to get the names , phoneno , isSpam or not

app.get("/name/:name" , async(req,res) =>{
    const reqname = req.params.name;
    const reqdata = await reg_frm.findOne({
        where:{
            name: reqname
        }
    }).then(function(reqdata){
        if(!reqdata){
            res.send('not find the existing name');
        }
        const reqcontct = reqdata.contact;
        const temp_obj = "No";
        const findcontct = spam_frm.findAll({
            where:{
                contct: reqcontct
            }
        }).then(function(findcontct){
            if(!findcontct){
              temp_obj ="No"
            }
             temp_obj="yes";
        })
        const obj ={
            reqobj: reqdata,
            spamcon: temp_obj,
        }
        res.status(200).json(obj);
    })
})

// Spam table to save data in database(post) and to get data from spam table(get)

app.post('/spam', async(req,res) =>{
    const contct = req.body.contct;
    const saveSpam = spam_frm.build({
        contct,
    });
    await saveSpam.save();
    res.send('send to spam successfully');
})

app.get('/spam', async(req,res) =>{
    const allData = await spam_frm.findAll();
    res.json(allData)
})

/*app.put('/:id', (req,res) =>{
    const data = req.body.data
    reg_frm.update({

    })
})*/


app.listen(port, () =>{
    console.log(`server starts at http://localhost:${port}`);
})