export interface PaginationParams {
  page: number
  limit: number
}

export interface PrismaSkipTake {
  skip: number
  take: number
}

export function toSkipTake({ page, limit }: PaginationParams): PrismaSkipTake {
  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}
