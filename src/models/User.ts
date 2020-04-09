import { 
	Document,
	model,
	Schema,
	PassportLocalModel,
} from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';

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
});

UserSchema.plugin(passportLocalMongoose);

interface IUserSchema extends Document {
	firstName: string;
	lastName: string;
	admin: boolean;
}

// Virtuals - getters of model instance
UserSchema.virtual("fullName").get(function(this: { firstName: string, lastName: string}) {
	return this.firstName + " " + this.lastName ;
});
  
// Methods of model instance
UserSchema.methods.testMethod = function() {
	return "Test method";
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

// Static methods for model
UserSchema.statics.findMyCompany = async function() {
	return 'your company';
}
  
// Interface for model
export interface IUserModel extends PassportLocalModel<IUser> {
	findMyCompany(): Promise<string>
}

export default model<IUser, IUserModel>('User', UserSchema);

// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1