import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';

import {
	verifyAdmin,
	verifyUser,
	getToken,
} from 'middleware/authenticate';
import { corsWithOptions } from 'middleware/cors';
import User, { IUser } from 'models/User';

const userRouter = express.Router();
userRouter.use(bodyParser.json());


userRouter.route('/')
	.get(corsWithOptions, verifyUser, verifyAdmin, (req, res, next) => {
		User.find({})
			.then((users) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json({users});
			}, (err) => next(err))
			.catch((err) => next(err));
	});


userRouter.route('/signup')
	.post(corsWithOptions, (req, res, next) => {
		User.register(new User({username: req.body.username}), req.body.password, (err, user:IUser) => {
				if(err) {
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.json({err})
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
								res.statusCode = 500;
								res.setHeader('Content-Type', 'application/json');
								res.json({err})
							} else {
								passport.authenticate('local')(req, res, () => {
									res.statusCode = 200;
									res.setHeader('Content-Type', 'application/json');
									res.json({success: true, status: 'Registration Successful!'});
								});
							}
						}).catch((err) => next(err));
				}
		})
	});


userRouter.route('/login')
	.post(corsWithOptions, passport.authenticate('local'), (req, res) => {
		const token = getToken({_id: (req.user as IUser)._id});
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({status: 'Authenticate Succesfull!', success: true, token});
	});


userRouter.route('/logout')
	.get(corsWithOptions, (req, res, next) => {
		const err = new Error('Delete your token yourself');
		res.statusCode = 403;
		next(err);
	});

export default userRouter;