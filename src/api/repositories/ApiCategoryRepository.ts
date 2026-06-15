import client from '../client';
import type { ICategoryRepository } from '@/repositories/ICategoryRepository';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

export class ApiCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const response = await client.get<Category[]>('/categories');
    return response.data;
  }

  async getById(id: string): Promise<Category> {
    const response = await client.get<Category>(`/categories/${id}`);
    return response.data;
  }

  async create(data: CreateCategoryRequest): Promise<Category> {
    const response = await client.post<Category>('/categories', data);
    return response.data;
  }

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await client.put<Category>(`/categories/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await client.delete(`/categories/${id}`);
  }
}
