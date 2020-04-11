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
import { sendResponse } from 'utils/response';
import { IUser } from 'models/User';

const taskRouter = express.Router();
taskRouter.use(bodyParser.json());

taskRouter.route('/')
	.options(corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors, (req, res, next) => {
		Task.find({})
			.then((tasks) => {
				sendResponse(res, {data:{tasks}});
			}).catch((err) => next(err));
	}).post(corsWithOptions, verifyUser, (req, res, next) => {
		if(!req.body.author) req.body.author = (req.user as IUser)._id;
		Task.create(req.body)
			.then((task) => {
				console.log('Task created', task);
				sendResponse(res, {data:{tasks: [task]}});
			}).catch((err) => next(err));
	}).put(corsWithOptions, verifyUser, (req, res, next) => {
		sendResponse(res, {status: 403, msg: 'Put operation not supported on /tasks'})
	}).delete(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		Task.remove({})
			.then((resp) => {
				sendResponse(res, {data: {tasks:[resp]}});
			}).catch((err) => next(err));
	});


taskRouter.route('/:taskId')
	.options(corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors, (req, res, next) => {
		Task.findById(req.params.taskId)
			.then((task) => {
				if(task) return sendResponse(res, {data:{tasks: [task]}});
				return sendResponse(res, {status: 404, msg: 'Task not found' });
			}).catch((err) => next(err));
	}).post(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		sendResponse(res, {status: 403, msg: 'POST operation not supported on /tasks/' + req.params.taskId})
	}).put(corsWithOptions, verifyUser, (req, res, next) => {
		const userId = (req.user as IUser)._id;
		Task.updateById(req.params.taskId, req.body, userId)
			.then((params) => sendResponse(res, params))
			.catch((err) => next(err));
	}).delete(corsWithOptions, verifyUser, (req, res, next) => {
		const userId = (req.user as IUser)._id;
		Task.deleteById(req.params.taskId, userId)
			.then((params) => sendResponse(res, params))
			.catch((err) => next(err));
	});

export default taskRouter;
