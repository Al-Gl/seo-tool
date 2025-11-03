import React, { useState } from 'react';
import { Eye, Code, Clock } from 'lucide-react';
import { BeginnerRecommendation } from '@/types';
import { getPriorityColor, capitalize } from '@/lib/utils';
import { ErrorBoundary } from './ErrorBoundary';

// New component for beginner recommendations in technical details
export function BeginnerRecommendationCard({ recommendation }: { recommendation: BeginnerRecommendation }) {
  return (
    <ErrorBoundary>
      <BeginnerRecommendationCardInner recommendation={recommendation} />
    </ErrorBoundary>
  );
}

function BeginnerRecommendationCardInner({ recommendation }: { recommendation: BeginnerRecommendation }) {
  const [showTechnical, setShowTechnical] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
              {capitalize(recommendation.priority)} Priority
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
              {capitalize(recommendation.difficulty)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{recommendation.whyItMatters}</p>

          {/* Beginner Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
            <h5 className="font-medium text-blue-900 mb-2">How to fix this:</h5>
            <p className="text-blue-800 text-sm mb-2">{recommendation.beginnerGuide.whatToDo}</p>
            <div className="text-xs text-blue-700">
              <p><strong>Where:</strong> {recommendation.beginnerGuide.whereToFind}</p>
              <p><strong>Time needed:</strong> {recommendation.beginnerGuide.timeNeeded}</p>
              {recommendation.beginnerGuide.helpfulTips && (
                <p><strong>Tip:</strong> {recommendation.beginnerGuide.helpfulTips}</p>
              )}
            </div>
          </div>

          {/* Technical Details Toggle */}
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-gray-700 hover:text-gray-900 text-sm font-medium mb-3 flex items-center"
          >
            {showTechnical ? 'Hide Technical Details' : 'Show Technical Details'}
            <Code className="w-4 h-4 ml-1" />
          </button>

          {showTechnical && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
              <h5 className="font-medium text-gray-900 mb-2">Technical Implementation:</h5>
              <p className="text-gray-800 text-sm mb-2">{recommendation.technicalDetails.implementation}</p>
              {recommendation.technicalDetails.code && (
                <div className="mb-2">
                  <h6 className="font-medium text-gray-900 mb-1">Code:</h6>
                  <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs overflow-x-auto">
                    <code>{recommendation.technicalDetails.code}</code>
                  </pre>
                </div>
              )}
              <div>
                <h6 className="font-medium text-gray-900 mb-1">Testing:</h6>
                <p className="text-gray-700 text-sm">{recommendation.technicalDetails.testingSteps}</p>
              </div>
            </div>
          )}

          {/* Expected Outcome */}
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <p className="text-green-800 text-sm">
              <strong>Expected result:</strong> {recommendation.expectedOutcome}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for legacy recommendation format
export function LegacyRecommendationCard({ recommendation }: { recommendation: any }) {
  return (
    <ErrorBoundary>
      <LegacyRecommendationCardInner recommendation={recommendation} />
    </ErrorBoundary>
  );
}

function LegacyRecommendationCardInner({ recommendation }: { recommendation: any }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
            {recommendation.priority && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                {capitalize(recommendation.priority)} Priority
              </span>
            )}
          </div>

          {/* Main description */}
          {recommendation.description && (
            <div className="text-sm text-gray-600 mb-3">
              {typeof recommendation.description === 'string' ? (
                recommendation.description
              ) : (
                <pre className="whitespace-pre-wrap">{JSON.stringify(recommendation.description, null, 2)}</pre>
              )}
            </div>
          )}

          {/* Implementation details if available */}
          {recommendation.implementation && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-700 hover:text-gray-900 text-sm font-medium mb-2 flex items-center"
              >
                {showDetails ? 'Hide Implementation' : 'Show Implementation'}
                <Eye className="w-4 h-4 ml-1" />
              </button>

              {showDetails && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  {typeof recommendation.implementation === 'string' ? (
                    <p className="text-gray-800 text-sm">{recommendation.implementation}</p>
                  ) : (
                    <pre className="text-gray-800 text-sm whitespace-pre-wrap">
                      {JSON.stringify(recommendation.implementation, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Additional fields */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
            {recommendation.effort && (
              <span className="px-2 py-1 bg-gray-100 rounded-full">
                {recommendation.effort} effort
              </span>
            )}
            {recommendation.impact && (
              <span className="px-2 py-1 bg-gray-100 rounded-full">
                {recommendation.impact} impact
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}