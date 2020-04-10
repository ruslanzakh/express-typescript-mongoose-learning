import {
	Document,
	Schema,
	Model,
	model,
} from 'mongoose';
import { IUser } from './User';


const taskSchema: Schema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: false,
	},
	checked: {
		type: Boolean,
		default: false,
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
}, {
	timestamps: true,
})

interface ITaskSchema extends Document {
	title: string;
	description: string;
	checked: boolean;
}

// Basic interface of instance
interface ITaskBase extends ITaskSchema {
	
}

// Extended interface of instance
export interface ITask extends ITaskBase {
	author: IUser["_id"];
} 

export interface ITask_populated extends ITaskBase {
	author: IUser;
} 

// For model
export interface ITaskModel extends Model<ITask> {

}

export default model<ITask, ITaskModel>('Task', taskSchema);