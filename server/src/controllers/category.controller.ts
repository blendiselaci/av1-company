import type { Request, Response } from 'express'
import * as categoryService from '../services/category.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/apiResponse'
import type {
  AdminListCategoriesQuery,
  CreateCategoryInput,
  PublicListCategoriesQuery,
  ReorderCategoriesInput,
  UpdateCategoryInput,
} from '../validators/category.validator'

export const listPublicCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as PublicListCategoriesQuery
  const { items, meta } = await categoryService.listActiveCategories(query)
  sendSuccess(res, items, 200, meta)
})

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as AdminListCategoriesQuery
  const { items, meta } = await categoryService.listAllCategories(query)
  sendSuccess(res, items, 200, meta)
})

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id as string)
  sendSuccess(res, category)
})

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body as CreateCategoryInput)
  sendSuccess(res, category, 201)
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id as string, req.body as UpdateCategoryInput)
  sendSuccess(res, category)
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string)
  sendSuccess(res, { message: 'Category deleted' })
})

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const items = await categoryService.reorderCategories(req.body as ReorderCategoriesInput)
  sendSuccess(res, items)
})
