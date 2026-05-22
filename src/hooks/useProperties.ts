import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { propertiesApi, type PropertyParams } from '../api/properties.api';

export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (params: PropertyParams) => [...propertyKeys.lists(), params] as const,
  infiniteLists: () => [...propertyKeys.all, 'infinite-list'] as const,
  infiniteList: (params: Omit<PropertyParams, 'page'>) => [...propertyKeys.infiniteLists(), params] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  workflow: (id: string) => [...propertyKeys.detail(id), 'workflow'] as const,
  documents: (id: string) => [...propertyKeys.detail(id), 'documents'] as const,
};

export function useProperties(params?: PropertyParams) {
  return useQuery({
    queryKey: propertyKeys.list(params ?? {}),
    queryFn: () => propertiesApi.getAll(params),
  });
}

export function useInfiniteProperties(params?: Omit<PropertyParams, 'page'>) {
  const limit = 20;
  return useInfiniteQuery({
    queryKey: propertyKeys.infiniteList(params ?? {}),
    queryFn: ({ pageParam }) => propertiesApi.getAll({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertiesApi.getOne(id),
    enabled: !!id,
  });
}

export function usePropertyWorkflow(id: string) {
  return useQuery({
    queryKey: propertyKeys.workflow(id),
    queryFn: () => propertiesApi.getWorkflow(id),
    enabled: !!id,
  });
}

export function usePropertyDocuments(id: string) {
  return useQuery({
    queryKey: propertyKeys.documents(id),
    queryFn: () => propertiesApi.getDocuments(id),
    enabled: !!id,
  });
}
