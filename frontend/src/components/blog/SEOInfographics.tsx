import React from 'react';
import { InfoGraphic } from './InfoGraphic';
import { Search, Smartphone, Globe, Zap, Eye, BarChart3 } from 'lucide-react';

// Keyword Research Process Diagram
export const KeywordResearchProcess: React.FC = () => {
  const steps = [
    { icon: Search, title: 'Brainstorm', desc: 'Initial keyword ideas' },
    { icon: BarChart3, title: 'Research', desc: 'Use keyword tools' },
    { icon: Eye, title: 'Analyze', desc: 'Check search volume & competition' },
    { icon: Zap, title: 'Select', desc: 'Choose target keywords' }
  ];

  return (
    <InfoGraphic title="Keyword Research Process">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-accent-900 bg-opacity-30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-400">{index + 1}</span>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-gray-300">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-6 h-0.5 bg-gradient-to-r from-accent-400 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </InfoGraphic>
  );
};

// Mobile-First Indexing Illustration
export const MobileFirstIndexing: React.FC = () => {
  return (
    <InfoGraphic title="Mobile-First Indexing: Before vs After">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-red-400 mb-4">Before 2018</h4>
            <div className="bg-space-900 rounded-lg p-6 border border-red-500 border-opacity-30">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-12 bg-gray-600 rounded flex items-center justify-center">
                  <Globe className="w-8 h-6 text-gray-300" />
                </div>
                <div className="text-sm text-gray-300">Desktop version crawled first</div>
                <div className="w-px h-8 bg-gray-500"></div>
                <div className="w-8 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <Smartphone className="w-4 h-8 text-gray-400" />
                </div>
                <div className="text-xs text-gray-400">Mobile version secondary</div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-green-400 mb-4">After 2018</h4>
            <div className="bg-space-900 rounded-lg p-6 border border-green-500 border-opacity-30">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-12 bg-green-600 rounded flex items-center justify-center">
                  <Smartphone className="w-4 h-8 text-white" />
                </div>
                <div className="text-sm text-gray-300">Mobile version crawled first</div>
                <div className="w-px h-8 bg-gray-500"></div>
                <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center">
                  <Globe className="w-8 h-6 text-gray-400" />
                </div>
                <div className="text-xs text-gray-400">Desktop version secondary</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Google now primarily uses the mobile version of content for indexing and ranking
          </p>
        </div>
      </div>
    </InfoGraphic>
  );
};

// Schema Markup Types Chart
export const SchemaTypesChart: React.FC = () => {
  const schemaTypes = [
    { name: 'Article', usage: '85%', color: 'bg-blue-500' },
    { name: 'Local Business', usage: '70%', color: 'bg-green-500' },
    { name: 'Product', usage: '60%', color: 'bg-purple-500' },
    { name: 'FAQ', usage: '45%', color: 'bg-orange-500' },
    { name: 'Recipe', usage: '35%', color: 'bg-pink-500' },
    { name: 'Event', usage: '25%', color: 'bg-yellow-500' }
  ];

  return (
    <InfoGraphic title="Most Common Schema Markup Types">
      <div className="w-full max-w-4xl">
        <div className="space-y-4">
          {schemaTypes.map((schema, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-32 text-sm text-gray-300 text-right">{schema.name}</div>
              <div className="flex-1 bg-space-700 rounded-full h-6 relative">
                <div 
                  className={`${schema.color} h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: schema.usage }}
                ></div>
                <span className="absolute right-3 top-0.5 text-xs text-white font-medium">
                  {schema.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">
          * Based on usage frequency across top 10,000 websites
        </div>
      </div>
    </InfoGraphic>
  );
};

// Page Speed Optimization Waterfall
export const PageSpeedWaterfall: React.FC = () => {
  const optimizations = [
    { name: 'Original', time: 5.2, color: 'bg-red-500' },
    { name: 'Image Optimization', time: 3.8, color: 'bg-orange-500' },
    { name: 'CSS Minification', time: 3.2, color: 'bg-yellow-500' },
    { name: 'JavaScript Optimization', time: 2.6, color: 'bg-blue-500' },
    { name: 'CDN Implementation', time: 1.9, color: 'bg-green-500' },
    { name: 'Caching Strategy', time: 1.2, color: 'bg-emerald-500' }
  ];

  const maxTime = Math.max(...optimizations.map(opt => opt.time));

  return (
    <InfoGraphic title="Page Speed Optimization Timeline">
      <div className="w-full max-w-4xl">
        <div className="space-y-3">
          {optimizations.map((opt, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-40 text-sm text-gray-300 text-right">{opt.name}</div>
              <div className="flex-1 bg-space-700 rounded h-8 relative flex items-center">
                <div 
                  className={`${opt.color} h-full rounded transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                  style={{ width: `${(opt.time / maxTime) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{opt.time}s</span>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-400">
                {index > 0 && (
                  <span className="text-green-400">
                    -{((optimizations[index-1].time - opt.time) / optimizations[index-1].time * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between text-sm text-gray-400">
          <span>Optimization Steps</span>
          <span>Load Time Reduction: 77%</span>
        </div>
      </div>
    </InfoGraphic>
  );
};

// Internal Linking Structure
export const InternalLinkingStructure: React.FC = () => {
  return (
    <InfoGraphic title="Effective Internal Linking Structure">
      <div className="w-full max-w-4xl">
        <div className="relative">
          {/* Homepage */}
          <div className="text-center mb-8">
            <div className="w-20 h-16 bg-gradient-to-br from-accent-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Globe className="w-10 h-8 text-white" />
            </div>
            <span className="text-sm text-gray-300">Homepage</span>
          </div>

          {/* Category Pages */}
          <div className="flex justify-center space-x-8 mb-8">
            {['SEO Tools', 'Technical SEO', 'Content SEO'].map((category, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-12 bg-space-700 border-2 border-accent-400 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xs text-accent-400 font-medium text-center px-1">
                    {category.split(' ')[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{category}</span>
              </div>
            ))}
          </div>

          {/* Articles */}
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-8 h-6 bg-space-600 rounded flex items-center justify-center mb-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">Article</span>
              </div>
            ))}
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            {/* Homepage to Categories */}
            <line x1="50%" y1="80" x2="25%" y2="140" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            <line x1="50%" y1="80" x2="50%" y2="140" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            <line x1="50%" y1="80" x2="75%" y2="140" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
            
            {/* Categories to Articles */}
            <line x1="25%" y1="200" x2="15%" y2="260" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
            <line x1="25%" y1="200" x2="35%" y2="260" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
            <line x1="50%" y1="200" x2="45%" y2="260" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
            <line x1="50%" y1="200" x2="55%" y2="260" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
            <line x1="75%" y1="200" x2="65%" y2="260" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
            <line x1="75%" y1="200" x2="85%" y2="260" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-300">
          <p>Clear hierarchy with strategic internal links passing authority from top to bottom</p>
        </div>
      </div>
    </InfoGraphic>
  );
};