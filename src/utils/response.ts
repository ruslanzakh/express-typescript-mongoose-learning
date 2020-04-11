import { Response } from 'express';
import { ObjectList } from './interfaces';

/**
 * Возвращает структурированный ответ сервера, который необходимо будет потом отправить
 * Принимает объект с полями:
 * 	data - объект, который содержит массивы разных сущностей
 *  status - статус ответа
 *  msg - текстовое сообщение от сервера - опционально
 *  token - token авторизации от сервера - опционально
 * В будущем возможно расширение этого ответа под нужды разработки
 * @param params IGetResponseParams
 */
export const getResponseData = (params: IGetResponseParams): IResponse => {
	const {
		data = {},
		status = 200,
		msg,
		token, 
	} = params;

	return {
		data,
		status,
		msg,
		token, 
	}
}

/**
 * Устанавливаем заголовки для ответа сервера
 * По умолчанию ставит 200 ответ и Content-Type application/json'
 * Если необходимо изменить заголовки, новые данные надо отправить в объекте params
 * @param res Response
 * @param params ISetResponseHeadersParams
 */
export const setResponseHeaders = (res: Response, params: ISetResponseHeadersParams = {}) => {
	const {
		status = 200,
		headers,
	} = params;

	let defaultHeaders: IHeaders = {
		'Content-Type': 'application/json'
	}
	if(headers) defaultHeaders = {...defaultHeaders, ...headers};
	res.statusCode = status;
	return res.set(defaultHeaders);
}

/**
 * Отправляет ответ сервера
 * Указывает заголовки ответа
 * Заполняет данные для ответа структурированным объектом, содержащий свойства:
 *  data - объект, который содержит массивы разных сущностей
 *  status - статус ответа
 *  msg - текстовое сообщение от сервера - опционально
 *  token - token авторизации от сервера - опционально
 * Отправляет ответ
 * @param res 
 * @param params 
 */
export const sendResponse = (res: Response, params: ISendResponseParams = {}) => {

	const  {
		data = {},
		status = 200,
		msg,
		token,
		headers,
	} = params;

	setResponseHeaders(res, {status, headers});
	return res.json(getResponseData({
		data,
		status,
		msg,
		token,
	}))
}

export default {
	getResponseData,
	setResponseHeaders,
	sendResponse,
}


type Status = 200 | 400 | 401 | 403 | 404 | 500;

interface IGetResponseParams {
	data?: ObjectList<object[]>;
	status?: Status;
	msg?: string;
	token?: string;
}

interface IResponse extends IGetResponseParams {
	data: ObjectList<object[]>;
	status: Status;
}

interface ISetResponseHeadersParams {
	status?: Status;
	headers?: IHeaders
}

interface ISendResponseParams extends IGetResponseParams {
	headers?: IHeaders
}

type IHeaders  = ObjectList<string>;
