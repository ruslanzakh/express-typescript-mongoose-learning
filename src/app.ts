import express from 'express';
import createError from 'http-errors';
import path from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import morgan from 'morgan';
import { createStream as rfsCreateStream } from 'rotating-file-stream';
import swaggerUi from 'swagger-ui-express';

import {
	mongoUrl,
} from 'constants/server';
import swaggerDocument from 'swagger/swagger.json';

import usersRouter from 'routes/users/users';
import tasksRouter from 'routes/tasks/tasks';

const connect = mongoose.connect(mongoUrl);
connect.then((db) => {
	console.log('Connected correctly to server');
}, (err) => console.error(err));
  
const app = express();

app.all('*', (req, res, next) => {
	if(req.secure) {
		return next();
	} else {
	  	res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
	}
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// create a rotating write stream
var accessLogStream = rfsCreateStream('access.log', {
	interval: '1d', // rotate daily
	maxFiles: 30, // Maximum number of rotated files to keep in storage
	path: path.join(__dirname, 'log')
})
app.use(morgan('combined', { stream: accessLogStream }))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', tasksRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});
  
// error handler
app.use(function(err: any, req: any, res: any, next: any) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

export default app;