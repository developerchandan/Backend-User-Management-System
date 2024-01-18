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
const categoriesRoutes = require('./routes/categorie');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const resultsRoutes = require('./routes/results');
const contactsRoutes = require('./routes/contacts');
const humanRoutess = require('./routes/humanresources');
const questionRoutess = require('./routes/questions');
const subcategoryRoutess = require('./routes/sub_categorys');
const blogRoutes = require('./routes/blogs');
const privacyPolicyRoutes = require('./routes/privacypolicys');
const galleryRoutes = require('./routes/gallerys');
const testtypeRoutess = require('./routes/testtypes');
const profileRoutess = require('./routes/profiles');
const industryRoutess = require('./routes/industrys');
const departmentRoutess = require('./routes/departments');
const designationRoutess = require('./routes/designations');
const quiz_categoryRoutess = require('./routes/quiz-categorys');
const quizRoutess = require('./routes/quizs');
const certificateRoutess = require('./routes/certificates');
const assessmentRoutess = require('./routes/psychometricassessments');
const expert =require('./routes/expert');
const assignmentRoutes =require('./routes/assignments');
const expertReportRoutes =require('./routes/expertReports');
const demoRoutes =require('./routes/demo');

const api = process.env.API_URL;

 var port = process.env.PORT || 5000;

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
app.use(`${api}/privacy`, privacyPolicyRoutes);
app.use(`${api}/gallery`, galleryRoutes);
app.use(`${api}/testtype`, testtypeRoutess);
app.use(`${api}/profile`, profileRoutess);
app.use(`${api}/industry`, industryRoutess);
app.use(`${api}/department`, departmentRoutess);
app.use(`${api}/designation`, designationRoutess);
app.use(`${api}/quiz_category`, quiz_categoryRoutess);
app.use(`${api}/quiz`, quizRoutess);
app.use(`${api}/certificate`, certificateRoutess);
app.use(`${api}/assessment`, assessmentRoutess);
app.use(`${api}/expert`, expert);
app.use(`${api}/assignments`, assignmentRoutes);
app.use(`${api}/expert-report`, expertReportRoutes);
app.use(`${api}/demo`, demoRoutes);

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
