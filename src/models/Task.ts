import {
	Document,
	Schema,
	Model,
	model,
} from 'mongoose';
import { IUser } from './User';
import { ISendResponseParams } from 'utils/response';


const TaskSchema: Schema = new Schema({
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
});

/**
 * Update Task By Id
 * @param taskId {string} Task's id to update
 * @param data {ITaskToUpdate} Data to update
 * @param userId {string} Id of current user. We want to update only own tasks of current user
 */
TaskSchema.statics.updateById = async function(taskId: string, data: ITaskToUpdate, userId: string) {
	const task = await Task.findById(taskId);
	if(task === null) {
		return {
			status: 404,
			msg: 'Task not found',
		};
	} else if(task.author && !task.author.equals(userId)) {
		return {
			status: 401,
			msg: 'You don\'t have access for edit task ' + taskId,
		};
	}

	if(data.title) task.title = data.title;
	if(data.description) task.description = data.description;
	if(data.checked) task.checked = data.checked;

	await task.save();
	const newTask = await Task.findById(taskId);

	if(newTask) return {
		data:{
			tasks: [newTask],
		},
	};
	else return;
}


/**
 * Delete Task By Id
 * @param taskId {string} Task's id to delete
 * @param userId {string} Id of current user. We want to delete only own tasks of current user
 */
TaskSchema.statics.deleteById = async function(taskId: string, userId: string) {
	let task = await Task.findById(taskId);
	if(task === null) {
		return {
			status: 404,
			msg: 'Task ' + taskId + ' not found',
		};
	} else if(task.author && !task.author.equals(userId)) {
		return {
			status: 401,
			msg: 'You don\'t have access for edit task ' + taskId,
		}
	}
	task = await task.remove();
	return {
		data:{
			tasks: [task],
		},
	};
}

const Task =  model<ITask, ITaskModel>('Task', TaskSchema);
export default Task;



interface ITaskToUpdate {
	title?: string;
	description?: string;
	checked?: boolean;
}

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
	updateById: (id: string, data: ITaskToUpdate, userId: string) => Promise<ISendResponseParams | undefined>;
	deleteById: (id: string, userId: string) => Promise<ISendResponseParams>;
}
