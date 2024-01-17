'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

//Strict Transport Security (HSTS):
//Implement HSTS to enforce the use of HTTPS:
const hstsConfig = {
  maxAge: 31536000, // one year
  includeSubDomains: true,
  preload: true,
};

app.use(helmet());

app.use(helmet.xssFilter());
//Add the nosniff header to prevent browsers from interpreting files as a different MIME type:
app.use(helmet.noSniff());

// Use the hsts middleware with the specified configuration
app.use(helmet.hsts(hstsConfig));


// Use the dnsPrefetchControl middleware to disable DNS prefetching
app.use(helmet.dnsPrefetchControl());

//Use the frameguard middleware to prevent clickjacking attacks:
app.use(helmet.frameguard({ action: 'deny' }));

app.disable('x-powered-by');

//Implement a Content Security Policy to mitigate the risk of XSS attacks:
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts (for example, in HTML attributes)
      styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles (for example, in style attributes)
    },
  })
);


// Connect to MongoDB
//mongoose.connect(process.env.DB, {
 // useNewUrlParser: true,
 // useUnifiedTopology: true,
//})
mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});



app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
