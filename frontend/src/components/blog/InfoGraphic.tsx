import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface InfoGraphicProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoGraphic: React.FC<InfoGraphicProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <Card className={`my-8 bg-gradient-to-br from-space-800 to-space-700 border-space-600 ${className}`}>
      <CardContent className="p-8">
        {title && (
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            {title}
          </h3>
        )}
        <div className="flex justify-center">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

// Core Web Vitals Infographic Component
export const CoreWebVitalsInfographic: React.FC = () => {
  return (
    <InfoGraphic title="Core Web Vitals: The Essential Metrics">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* LCP */}
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="8"
                  strokeDasharray={`${2.5 * 31.4} ${10 * 31.4}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="65" textAnchor="middle" className="text-lg font-bold fill-white">
                  2.5s
                </text>
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-green-400 mb-2">
              Largest Contentful Paint
            </h4>
            <p className="text-sm text-gray-300">
              Measures loading performance. Good LCP is 2.5 seconds or less.
            </p>
          </div>

          {/* FID */}
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${1 * 31.4} ${9 * 31.4}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="60" textAnchor="middle" className="text-sm font-bold fill-white">
                  100
                </text>
                <text x="60" y="75" textAnchor="middle" className="text-xs fill-white">
                  ms
                </text>
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              First Input Delay
            </h4>
            <p className="text-sm text-gray-300">
              Measures interactivity. Good FID is 100 milliseconds or less.
            </p>
          </div>

          {/* CLS */}
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="8"
                  strokeDasharray={`${0.1 * 31.4} ${9.9 * 31.4}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="65" textAnchor="middle" className="text-lg font-bold fill-white">
                  0.1
                </text>
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-purple-400 mb-2">
              Cumulative Layout Shift
            </h4>
            <p className="text-sm text-gray-300">
              Measures visual stability. Good CLS is 0.1 or less.
            </p>
          </div>
        </div>

        {/* Scoring Guide */}
        <div className="mt-8 pt-6 border-t border-space-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
              <span className="text-xs text-gray-300">Good</span>
            </div>
            <div>
              <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
              <span className="text-xs text-gray-300">Needs Improvement</span>
            </div>
            <div>
              <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-1"></div>
              <span className="text-xs text-gray-300">Poor</span>
            </div>
          </div>
        </div>
      </div>
    </InfoGraphic>
  );
};

// SEO Audit Flowchart Component
export const SEOAuditFlowchart: React.FC = () => {
  const steps = [
    'Technical Analysis',
    'Content Audit',
    'Keyword Research',
    'Competitor Analysis',
    'Implementation',
    'Monitoring'
  ];

  return (
    <InfoGraphic title="SEO Audit Process Flow">
      <div className="w-full max-w-3xl">
        <div className="flex flex-wrap justify-center items-center gap-4">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-accent-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                  {index + 1}
                </div>
                <span className="text-sm text-center text-gray-300 max-w-20">
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block">
                  <svg width="40" height="20" viewBox="0 0 40 20">
                    <path
                      d="M5 10 L35 10"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#38bdf8"
                        />
                      </marker>
                    </defs>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </InfoGraphic>
  );
};