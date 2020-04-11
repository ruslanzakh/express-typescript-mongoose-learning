import {
	model,
	Schema,
	PassportLocalModel,
	PassportLocalDocument,
} from "mongoose";
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';

import { ISendResponseParams } from 'utils/response';

const UserSchema: Schema = new Schema({
	firstname: {
		type: String,
		default: '',
	},
	lastname: {
		type: String,
		default: '',
	},
	admin: {
		type: Boolean,
		default: false,
	}
}, {
    timestamps: true,
});

UserSchema.plugin(passportLocalMongoose);

// Virtuals - getters of model instance
UserSchema.virtual("fullName").get(function(this: { firstName: string, lastName: string}) {
	return this.firstName + " " + this.lastName ;
});
  
// Methods of model instance
UserSchema.methods.testMethod = function() {
	return "Test method";
}

/**
 * User Registration
 * @param data {IUserToSave} Data to save user
 */
UserSchema.statics.signUp = async (data:IUserToSave ) => {
	try {
		let user = await User.register(new User({username: data.username}), data.password);
		if(data.firstname) {
			user.firstname = data.firstname;
		}
		if(data.lastname) {
			user.lastname = data.lastname;
		}
	
		user = await user.save();
		await passport.authenticate('local');
		return {
			msg: 'Registration Successful!',
		}
	} catch(err) {
		return {
			status: 500,
			msg: err.message ? err.message : err,
		}
	}


}

const User = model<IUser, IUserModel>('User', UserSchema);
export default User;

interface IUserToSave {
	username: string;
	password: string;
	firstname?: string;
	lastname?: string;
}

interface IUserSchema extends PassportLocalDocument {
	firstname: string;
	lastname: string;
	admin: boolean;
}
  
// Basic interface of instance
interface IUserBase extends IUserSchema {
	testMethod(): string;
	fullName: string;
}

// Extended interface of instance
export interface IUser extends IUserBase {
	// company: ICompany["_id"];
}   

// Interface for model
export interface IUserModel extends PassportLocalModel<IUser> {
	signUp:  (data:IUserToSave ) => Promise<ISendResponseParams>; 
}
