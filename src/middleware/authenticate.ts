import passport from 'passport';
import { Strategy as localStrategy } from 'passport-local';
import { Strategy as jwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { Response, 	NextFunction } from 'express';


import User, { IUser } from 'models/User';
import { secretKey } from 'constants/server';
import { RequestWithUser } from 'interfaces/express';


passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user: IUser) => jwt.sign(user, secretKey, { expiresIn: 3600});

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secretKey,
}

exports.jwtPassport = passport.use(new jwtStrategy(opts, (jwt_payload, done) => {
	console.log("JWT payload: ", jwt_payload);
	User.findOne({_id: jwt_payload._id}, (err, user) => {
		if(err) {
			return done(new Error(err), false);
		} else if(user) {
			return done(null, user)
		} else {
			return done(null, false);
		}
	})
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req: RequestWithUser
, res: Response, next: NextFunction) => {
	if(!req.user || req.user.admin === false) {
		res.statusCode = 403;
		const err = new Error('You are not authorized to perform ' + req.method + ' operation!');
		next(err);
	} else next();
}