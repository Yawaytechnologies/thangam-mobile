import api from './axios';
import type { Property, PropertyType, WorkflowStatus, PaginatedResponse } from '../types';

export interface PropertyParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyType?: PropertyType;
  workflowStatus?: WorkflowStatus;
  branchId?: string;
}

export interface WorkflowDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  uploadedAt: string;
}

export interface PropertyWorkflow {
  id: string;
  propertyId: string;
  status: WorkflowStatus;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
}

export const propertiesApi = {
  getAll: (params?: PropertyParams): Promise<PaginatedResponse<Property>> =>
    api.get('/properties', { params }).then((r) => r.data.data),

  getOne: (id: string): Promise<Property> =>
    api.get(`/properties/${id}`).then((r) => r.data.data),

  getWorkflow: (id: string): Promise<PropertyWorkflow> =>
    api.get(`/properties/${id}/workflow`).then((r) => r.data.data),

  getDocuments: (id: string): Promise<WorkflowDocument[]> =>
    api.get(`/properties/${id}/documents`).then((r) => r.data.data),
};
