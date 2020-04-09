import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
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

User.plugin(passportLocalMongoose);

export default mongoose.model('User', User);