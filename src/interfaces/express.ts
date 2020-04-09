import { IUser } from  'models/User';

export interface RequestWithUser extends Request {
	user?: IUser;
}