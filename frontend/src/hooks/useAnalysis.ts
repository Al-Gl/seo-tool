import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi, handleApiError } from '@/lib/api';
import { AnalysisRequest, AnalysisResponse, LoadingState, ErrorState } from '@/types';

// Query keys
export const ANALYSIS_QUERY_KEYS = {
  all: ['analyses'] as const,
  lists: () => [...ANALYSIS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ANALYSIS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ANALYSIS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ANALYSIS_QUERY_KEYS.details(), id] as const,
  status: (id: string) => [...ANALYSIS_QUERY_KEYS.all, 'status', id] as const,
} as const;

// Hook for submitting analysis
export const useSubmitAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AnalysisRequest) => analysisApi.submit(data),
    onSuccess: (data) => {
      // Invalidate and refetch analysis lists
      queryClient.invalidateQueries({ queryKey: ANALYSIS_QUERY_KEYS.lists() });
      // Add the new analysis to the cache
      queryClient.setQueryData(ANALYSIS_QUERY_KEYS.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Analysis submission failed:', handleApiError(error));
    }
  });
};

// Hook for getting analysis by ID
export const useAnalysis = (id: string | null, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.detail(id || ''),
    queryFn: () => analysisApi.getById(id!),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// Hook for polling analysis status
export const useAnalysisStatus = (id: string | null, options: { 
  enabled?: boolean; 
  refetchInterval?: number;
} = {}) => {
  const { enabled = true, refetchInterval = 2000 } = options;
  
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.status(id || ''),
    queryFn: () => analysisApi.getStatus(id!),
    enabled: !!id && enabled,
    refetchInterval: (data) => {
      // Stop polling if analysis is completed or failed
      if (!data || data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
        return false;
      }
      return refetchInterval;
    },
    staleTime: 0, // Always fresh for status updates
  });
};

// Hook for getting analysis history
export const useAnalysisHistory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ANALYSIS_QUERY_KEYS.list(`page-${page}-limit-${limit}`),
    queryFn: () => analysisApi.getHistory(page, limit),
    staleTime: 60000, // 1 minute
  });
};

// Hook for cancelling analysis
export const useCancelAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => analysisApi.cancel(id),
    onSuccess: (_, id) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ANALYSIS_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ANALYSIS_QUERY_KEYS.status(id) });
      queryClient.invalidateQueries({ queryKey: ANALYSIS_QUERY_KEYS.lists() });
    },
  });
};

// Custom hook for managing analysis flow
export const useAnalysisFlow = () => {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  const submitMutation = useSubmitAnalysis();
  const cancelMutation = useCancelAnalysis();
  
  const analysis = useAnalysis(currentAnalysisId);
  const status = useAnalysisStatus(currentAnalysisId, {
    enabled: !!currentAnalysisId
  });

  // Submit analysis
  const submitAnalysis = useCallback(async (data: AnalysisRequest) => {
    try {
      setErrorState({ hasError: false });
      setLoadingState({ isLoading: true, message: 'Submitting analysis...' });
      
      const response = await submitMutation.mutateAsync(data);
      setCurrentAnalysisId(response.analysisId);
      
      setLoadingState({ 
        isLoading: true, 
        message: 'Analysis started...',
        progress: 0 
      });
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setErrorState({ hasError: true, message: errorMessage });
      setLoadingState({ isLoading: false });
      throw error;
    }
  }, [submitMutation]);

  // Cancel analysis
  const cancelAnalysis = useCallback(async () => {
    if (!currentAnalysisId) return;
    
    try {
      await cancelMutation.mutateAsync(currentAnalysisId);
      setLoadingState({ isLoading: false });
      setCurrentAnalysisId(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setErrorState({ hasError: true, message: errorMessage });
    }
  }, [currentAnalysisId, cancelMutation]);

  // Reset state
  const reset = useCallback(() => {
    setCurrentAnalysisId(null);
    setLoadingState({ isLoading: false });
    setErrorState({ hasError: false });
  }, []);

  // Update loading state based on status
  useEffect(() => {
    console.log('🔄 useAnalysisFlow status effect:', {
      hasStatusData: !!status.data,
      statusData: status.data,
      isLoadingState: loadingState.isLoading,
      currentAnalysisId
    });
    
    if (status.data && loadingState.isLoading) {
      const { status: analysisStatus, progress } = status.data;
      
      console.log('📊 Processing status update:', {
        analysisStatus,
        progress,
        analysisId: currentAnalysisId
      });
      
      let message = 'Processing...';
      switch (analysisStatus) {
        case 'pending':
          message = 'Preparing analysis...';
          break;
        case 'crawling':
          message = 'Crawling website...';
          break;
        case 'analyzing':
          message = 'Analyzing with AI...';
          break;
        case 'completed':
          console.log('✅ Analysis flow detected completion for:', currentAnalysisId);
          setLoadingState({ isLoading: false });
          return;
        case 'failed':
          console.log('❌ Analysis flow detected failure');
          setErrorState({ hasError: true, message: 'Analysis failed' });
          setLoadingState({ isLoading: false });
          return;
        case 'cancelled':
          console.log('🚫 Analysis flow detected cancellation');
          setLoadingState({ isLoading: false });
          return;
      }
      
      if (analysisStatus !== 'completed' && analysisStatus !== 'failed' && analysisStatus !== 'cancelled') {
        setLoadingState({ 
          isLoading: true, 
          message, 
          progress 
        });
      }
    }
  }, [status.data, loadingState.isLoading, currentAnalysisId]);

  return {
    // State
    currentAnalysisId,
    loadingState,
    errorState,
    analysis: analysis.data,
    statusData: status.data,
    
    // Actions
    submitAnalysis,
    cancelAnalysis,
    reset,
    
    // Status
    isSubmitting: submitMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isAnalysisLoading: analysis.isLoading,
  };
};