import type { Request, Response } from 'express'
import * as userService from '../services/user.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from '../validators/user.validator'

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListUsersQuery
  const { items, meta } = await userService.listUsers(query)
  sendSuccess(res, items, 200, meta)
})

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string)
  sendSuccess(res, user)
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body as CreateUserInput)
  sendSuccess(res, user, 201)
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body as UpdateUserInput)
  sendSuccess(res, user)
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string, req.user!.id)
  sendSuccess(res, { message: 'User deleted' })
})
