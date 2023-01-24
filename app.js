const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const Country = require('country-state-city').Country;
const State = require('country-state-city').State;
const City = require('country-state-city').City;

app.use(cors());
app.options("*", cors());

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

  
  // app.get('/getCountry', function(req, res, next) {
  // //join collection
  // var MongoClient = require('mongodb').MongoClient;
  //   var url = "mongodb+srv://chandan:Kumar@498@cluster0.urnn3.mongodb.net/?retryWrites=true&w=majority";
  //   MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  //       if (err) throw err;
  //       var dbo = db.db("API");
  //       //Find the  country:
  //       var countriesBulk = dbo.collection('countries').initializeOrderedBulkOp();
  //       var countries = Country.getAllCountries();
  //       countries.forEach(country => {
  //           countriesBulk.insert({ name: country.name, short_name: country.isoCode })
  //       });
  //       countriesBulk.execute();
  //       console.log('Countries inserted')
        

  //       var stateBulk = dbo.collection('states').initializeOrderedBulkOp();
  //       var states = State.getAllStates();
  //       states.forEach(state => {
  //           stateBulk.insert({ name: state.name, country_short_name: state.countryCode })
  //       });
  //       stateBulk.execute();
  //       console.log('State inserted')


  //       var cityBulk = dbo.collection('cities').initializeOrderedBulkOp();
  //       var cities = City.getAllCities();
  //       cities.forEach(city => {
  //           cityBulk.insert({ name: city.name, state_name: city.stateCode })
  //       });
  //       cityBulk.execute();
  //       console.log('cities inserted')

  //   });
  // });
//Server
app.listen(port, ()=>{

  console.log(`server is running http://localhost:${port}`);
})
