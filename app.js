const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");


app.use(cors());
app.options("*", cors());

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);


//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const resultsRoutes = require('./routes/results');
const contactsRoutes = require('./routes/contacts');
const humanRoutess = require('./routes/humanresources');
const questionRoutess = require('./routes/questions');
const subcategoryRoutess = require('./routes/sub_categorys');
const blogRoutes = require('./routes/blogs');
const galleryRoutes = require('./routes/gallerys');
const testtypeRoutess = require('./routes/testtypes');
const profileRoutess = require('./routes/profiles');

const api = process.env.API_URL;

 var port = process.env.PORT || 4000;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/results`, resultsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/contacts`, contactsRoutes);
app.use(`${api}/strength`, humanRoutess);
app.use(`${api}/question`, questionRoutess);
app.use(`${api}/subcategory`, subcategoryRoutess);
app.use(`${api}/blogs`, blogRoutes);
app.use(`${api}/gallery`, galleryRoutes);
app.use(`${api}/testtype`, testtypeRoutess);
app.use(`${api}/profile`, profileRoutess);





//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Sudhakshta",
    
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, ()=>{

  console.log(`server is running http://localhost:${port}`);
})
