import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';

import {
	verifyAdmin,
	verifyUser,
	getToken,
} from 'middleware/authenticate';
import { sendResponse } from 'utils/response';
import { corsWithOptions } from 'middleware/cors';
import User, { IUser } from 'models/User';

const userRouter = express.Router();
userRouter.use(bodyParser.json());


userRouter.route('/')
	.get(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		User.find({})
			.then((users) => {
				sendResponse(res, {
					data: {users},
				})
			}, (err) => next(err))
			.catch((err) => next(err));
	});


userRouter.route('/signup')
	.post(corsWithOptions, (req, res, next) => {
		User.register(new User({username: req.body.username}), req.body.password, (err, user: IUser) => {
				if(err) {
					sendResponse(res, {
						status: 500,
						msg: err,
					});
				} else {
					if(req.body.firstname) {
						user.firstname = req.body.firstname;
					}
					if(req.body.lastname) {
						user.lastname = req.body.lastname;
					}
					user.save()
						.then((user) => {
							if(err) {
								sendResponse(res, {
									status: 500,
									msg: err,
								});
							} else {
								passport.authenticate('local')(req, res, () => {
									sendResponse(res, {
										msg: 'Registration Successful!',
									});
								});
							}
						}).catch((err) => next(err));
				}
		})
	});


userRouter.route('/login')
	.post(corsWithOptions, passport.authenticate('local'), (req, res) => {
		const token = getToken({_id: (req.user as IUser)._id});
		sendResponse(res, {
			msg: 'Authenticate Succesfull!',
			token,
		});
	});


userRouter.route('/logout')
	.get(corsWithOptions, (req, res, next) => {
		sendResponse(res, {
			msg: 'Delete your token yourself',
			status: 400,
		});
	});

export default userRouter;