import React from 'react';
import { 
  Globe, 
  Brain, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Loader2,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AnalysisStatus, LoadingState } from '@/types';
import { formatDuration } from '@/lib/utils';

interface ProgressTrackerProps {
  status: AnalysisStatus;
  progress?: number;
  estimatedTimeRemaining?: number;
  currentStep?: string;
  onCancel?: () => void;
  isCancelling?: boolean;
  loadingState?: LoadingState;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const progressSteps: ProgressStep[] = [
  {
    id: 'pending',
    label: 'Preparing',
    icon: Clock,
    description: 'Setting up your analysis'
  },
  {
    id: 'crawling',
    label: 'Crawling',
    icon: Globe,
    description: 'Discovering and crawling your website'
  },
  {
    id: 'analyzing',
    label: 'Analyzing',
    icon: Brain,
    description: 'AI is analyzing your website data'
  },
  {
    id: 'completed',
    label: 'Complete',
    icon: CheckCircle,
    description: 'Analysis completed successfully'
  }
];

const getStepStatus = (stepId: string, currentStatus: AnalysisStatus) => {
  const statusOrder = ['pending', 'crawling', 'analyzing', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepId);
  
  if (currentStatus === 'failed') {
    if (stepIndex <= currentIndex) return 'error';
    return 'pending';
  }
  
  if (currentStatus === 'cancelled') {
    if (stepIndex <= currentIndex) return 'cancelled';
    return 'pending';
  }
  
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'pending';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-success-600 bg-success-100';
    case 'current':
      return 'text-primary-600 bg-primary-100';
    case 'error':
      return 'text-danger-600 bg-danger-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-400 bg-gray-50';
  }
};

const getStatusIcon = (status: string, StepIcon: React.ComponentType<{ className?: string }>) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5" />;
    case 'current':
      return <Loader2 className="w-5 h-5 animate-spin" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5" />;
    default:
      return <StepIcon className="w-5 h-5" />;
  }
};

export function ProgressTracker({ 
  status, 
  progress, 
  estimatedTimeRemaining,
  currentStep,
  onCancel,
  isCancelling = false,
  loadingState
}: ProgressTrackerProps) {
  const isActive = status !== 'completed' && status !== 'failed' && status !== 'cancelled';
  const showProgress = progress !== undefined && progress >= 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Analysis Progress</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {status === 'completed' && 'Your SEO analysis is ready!'}
            {status === 'failed' && 'Analysis encountered an error'}
            {status === 'cancelled' && 'Analysis was cancelled'}
            {isActive && (loadingState?.message || 'Processing your website...')}
          </p>
        </div>
        {isActive && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            loading={isCancelling}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {showProgress && isActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Time Estimate */}
        {estimatedTimeRemaining && isActive && (
          <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700">Estimated time remaining</span>
            </div>
            <span className="font-medium text-blue-900">
              {formatDuration(estimatedTimeRemaining)}
            </span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="space-y-4">
          {progressSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.id, status);
            const statusColor = getStatusColor(stepStatus);
            const isCurrentStep = stepStatus === 'current';
            
            return (
              <div key={step.id} className="flex items-start space-x-4">
                {/* Step Indicator */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                  ${statusColor}
                `}>
                  {getStatusIcon(stepStatus, step.icon)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`
                      text-sm font-medium transition-colors duration-300
                      ${isCurrentStep ? 'text-primary-900' : 
                        stepStatus === 'completed' ? 'text-success-900' :
                        stepStatus === 'error' ? 'text-danger-900' :
                        stepStatus === 'cancelled' ? 'text-gray-700' :
                        'text-gray-500'}
                    `}>
                      {step.label}
                    </h4>
                    {isCurrentStep && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-primary-600 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 h-1 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                  <p className={`
                    text-xs mt-1 transition-colors duration-300
                    ${isCurrentStep ? 'text-primary-700' : 'text-gray-500'}
                  `}>
                    {step.description}
                  </p>
                  
                  {/* Current Step Detail */}
                  {isCurrentStep && currentStep && (
                    <p className="text-xs text-primary-600 mt-1 animate-fade-in">
                      {currentStep}
                    </p>
                  )}
                </div>

                {/* Connection Line */}
                {index < progressSteps.length - 1 && (
                  <div className="absolute left-[38px] mt-10 w-0.5 h-8 bg-gray-200 -z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Status Messages */}
        {status === 'failed' && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-danger-900">
                  Analysis Failed
                </h4>
                <p className="text-sm text-danger-700 mt-1">
                  We encountered an error while analyzing your website. Please try again or contact support if the issue persists.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Analysis Cancelled
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  The analysis was cancelled before completion. You can start a new analysis anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-success-900">
                  Analysis Complete!
                </h4>
                <p className="text-sm text-success-700 mt-1">
                  Your SEO analysis is ready. Review the results and recommendations below.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}