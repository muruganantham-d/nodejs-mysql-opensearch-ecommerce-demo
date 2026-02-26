// HEADER: Express app factory with middlewares, routes, 404 handler, and global error handler.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

/*
BOTTOM EXPLANATION
- Responsibility: Composes middleware and routes into a reusable Express application instance.
- Key syntax: Middleware order matters; parsers/loggers must run before routes and error handlers run last.
- Common mistakes: Forgetting `express.json()` makes `req.body` undefined for JSON POST/PUT requests.
*/
