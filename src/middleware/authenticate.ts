import passport from 'passport';
import { Strategy as localStrategy } from 'passport-local';
import { Strategy as jwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


import User, { IUser } from 'models/User';
import { secretKey } from 'constants/server';
import { sendResponse } from 'utils/response';


passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

export const getToken = (user: {_id: string}) => jwt.sign(user, secretKey, { expiresIn: 3600});

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secretKey,
}

passport.use(new jwtStrategy(opts, (jwt_payload, done) => {
	console.log("JWT payload: ", jwt_payload);
	User.findOne({_id: jwt_payload._id}, (err, user) => {
		if(err) {
			return done(err, false);
		} else if(user) {
			return done(null, user);
		} else {
			return done(null, false);
		}
	})
}));

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('jwt', {session: false}, function(err, user, info) {
		if(err) {
			return sendResponse(res, {
				status: 403,
				msg: err,
			})
		}
		if(info) {
			return sendResponse(res, {
				status: 403,
				msg: info.message,
			})
		}
		if(!user) {
			return sendResponse(res, {
				status: 403,
				msg: 'User not found',
			})
		}
		req.logIn(user, function(err) {
			if (err) return next(err);
			return next();
		});
	})(req, res, next);
}; 

export const verifyAdmin = (req: Request
, res: Response, next: NextFunction) => {
	if(!req.user || (req.user as IUser).admin === false) {
		return sendResponse(res, {
			status: 403,
			msg: 'You are not authorized to perform this ' + req.method + ' operation!'
		})
	} else next();
}