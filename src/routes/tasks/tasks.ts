import express from 'express';
import bodyParser from 'body-parser';
import {
	verifyUser,
	verifyAdmin,
} from 'middleware/authenticate';
import {
	cors,
	corsWithOptions,
} from 'middleware/cors';

import Task from 'models/Task';
import { IUser } from 'models/User';

const taskRouter = express.Router();
taskRouter.use(bodyParser.json());

taskRouter.route('/')
	.options(corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors, (req, res, next) => {
		Task.find({})
			.then((tasks) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json({tasks});
			}).catch((err) => next(err));
	}).post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		Task.create(req.body)
			.then((task) => {
				console.log('Task created', task);
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json({tasks: [task]})
			}).catch((err) => next(err));
	}).put(corsWithOptions, verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.send('Put operation not supported on /tasks');
	}).delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		Task.remove({})
			.then((resp) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(resp);
			}).catch((err) => next(err));
	});


taskRouter.route('/:taskId')
	.options(corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors, (req, res, next) => {
		Task.findById(req.params.taskId)
			.then((task) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json({tasks: [task]});
			}).catch((err) => next(err));
	}).post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		res.statusCode = 403;
        res.send('POST operation not supported on /tasks/' + req.params.taskId);
	}).put(corsWithOptions, verifyUser, (req, res, next) => {
		Task.findById(req.params.taskId)
			.then((task) => {
				if(task === null) {
					const err = new Error('Task ' + req.params.taskId + ' not found');
					res.statusCode = 404;
					return next(err);
				} else if(!task.author.equals((req.user as IUser)._id)) {
					const err = new Error('You don\'t have access for edit task ' + req.params.taskId);
					res.statusCode = 401;
					return next(err);
				} else {
					if(req.body.title) task.title = req.body.title;
					if(req.body.description) task.description = req.body.description;
					if(req.body.checked) task.checked = req.body.checked;
					task.save()
						.then((task) => {
							return Task.findById(req.params.taskId);
						})
						.then((task) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(task);
						}).catch((err) => next(err));
				}
			}).catch((err) => next(err));
	}).delete(corsWithOptions, verifyUser, (req, res, next) => {
		Task.findById(req.params.taskId)
			.then((task) => {
				if(task === null) {
					const err = new Error('Task ' + req.params.taskId + ' not found');
					res.statusCode = 404;
					return next(err);
				} else if(!task.author.equals((req.user as IUser)._id)) {
					const err = new Error('You don\'t have access for edit task ' + req.params.taskId);
					res.statusCode = 401;
					return next(err);
				} else {
					task.remove()
						.then((task) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(task);
						}).catch((err) => next(err));
				}
			}).catch((err) => next(err));
	});

export default taskRouter;
