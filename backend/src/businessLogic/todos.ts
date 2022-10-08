import * as uuid from 'uuid';
import { TodosAccess } from '../dataLayer/todosAcess';
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
// import * as createError from 'http-errors'


const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('TodosAccess')

// TODO: Implement businessLogic
export const createTodo = async (createTodoRequest: CreateTodoRequest, userId: string) => {
    const todoId = uuid.v4()
    const newTodo: TodoItem = {
        todoId,
        userId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    logger.info('creating todo' + JSON.stringify(newTodo))

    await todosAccess.createTodoItem(newTodo)

    return newTodo
}

export const deleteTodo = async (todoId: string, userId: string): Promise<void> => {
    return await todosAccess.deleteTodoItem(userId, todoId)
}

export const getUploadUrl = async (todoId: string): Promise<string> => {
    logger.info('creating signed upload url')
    return await attachmentUtils.getUploadUrl(bucketName, todoId, urlExpiration)
}

export const getTodosForUser = async (userId: string) => {
    return await todosAccess.getTodosForUser(userId)
}
export const updateTodo = async (userId: string, todoId: string, updatedTodo: UpdateTodoRequest) => {
    logger.info('calling update todo in todosAccess', updateTodo)
    return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}