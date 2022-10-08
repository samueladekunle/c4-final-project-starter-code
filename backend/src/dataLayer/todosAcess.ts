import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk-core'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly tableName = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ) { }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo item')

        await this.docClient.put({
            TableName: this.tableName,
            Item: todoItem,
        }).promise()

        logger.info(`Created todo item ${todoItem}`)
        return todoItem
    }

    async updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest): Promise<UpdateTodoRequest> {
        logger.info(`Update to do item`)

        await this.docClient.update({
            TableName: this.tableName,
            Key: {
                userId,
                todoId,
            },
            UpdateExpression: "set dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":dueDate": updateTodo.dueDate,
                ":done": updateTodo.done,
            }
        }).promise()


        logger.info(`Updated todo item ${updateTodo}`)
        return updateTodo
    }

    async getTodosForUser(userId: string) {
        const result = await this.docClient.query({
            TableName: this.tableName,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        logger.info(`Todo Items for user:${userId} retrieved`, result)

        return result
    }

    async deleteTodoItem(userId: string, todoId: string) {
        logger.info(`Delete todo item: ${todoId}`)
        await this.docClient.delete({
            TableName: this.tableName,
            Key: {
                userId,
                todoId,
            }
        }).promise()
        logger.info(`Deleted todo item ${todoId}`)
    }
}