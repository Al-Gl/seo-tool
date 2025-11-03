import { useQuery } from '@tanstack/react-query';
import { promptApi, handleApiError } from '@/lib/api';
import { PromptTemplate } from '@/types';

// Query keys
export const PROMPT_QUERY_KEYS = {
  all: ['prompts'] as const,
  lists: () => [...PROMPT_QUERY_KEYS.all, 'list'] as const,
  details: () => [...PROMPT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROMPT_QUERY_KEYS.details(), id] as const,
} as const;

// Hook for getting all prompt templates
export const usePrompts = () => {
  return useQuery({
    queryKey: PROMPT_QUERY_KEYS.lists(),
    queryFn: () => promptApi.getAll(),
    staleTime: 300000, // 5 minutes (prompts don't change often)
    gcTime: 600000, // 10 minutes
  });
};

// Hook for getting specific prompt template
export const usePrompt = (id: string | null) => {
  return useQuery({
    queryKey: PROMPT_QUERY_KEYS.detail(id || ''),
    queryFn: () => promptApi.getById(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

// Hook for getting prompts grouped by category
export const usePromptsByCategory = () => {
  const { data: prompts, ...queryResult } = usePrompts();
  
  const groupedPrompts = prompts?.reduce((acc, prompt) => {
    const category = prompt.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(prompt);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);

  return {
    ...queryResult,
    data: groupedPrompts,
    prompts,
  };
};

// Hook for getting default prompts for analysis types
export const useDefaultPrompts = () => {
  const { data: prompts, ...queryResult } = usePrompts();
  
  const defaultPrompts = prompts?.filter(prompt => prompt.isDefault) || [];
  
  // Map analysis types to their default prompts
  const promptsByAnalysisType = {
    'complete-seo-audit': defaultPrompts.find(p => p.name.toLowerCase().includes('complete') || p.name.toLowerCase().includes('audit')),
    'content-analysis': defaultPrompts.find(p => p.name.toLowerCase().includes('content')),
    'technical-seo': defaultPrompts.find(p => p.name.toLowerCase().includes('technical')),
    'competitor-analysis': defaultPrompts.find(p => p.name.toLowerCase().includes('competitor')),
    'local-seo': defaultPrompts.find(p => p.name.toLowerCase().includes('local')),
    'custom': null,
  };

  return {
    ...queryResult,
    data: promptsByAnalysisType,
    defaultPrompts,
  };
};