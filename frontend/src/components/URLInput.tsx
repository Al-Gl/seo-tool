import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { AnalysisType, URLInputFormData } from '@/types';
import { isValidUrl, formatUrl } from '@/lib/utils';

// Validation schema
const urlInputSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .refine((url) => isValidUrl(url), 'Please enter a valid URL'),
  analysisType: z.enum([
    'complete-seo-audit',
    'content-analysis',
    'technical-seo',
    'competitor-analysis',
    'local-seo',
    'custom'
  ] as const),
  customPrompt: z.string().optional(),
});

interface URLInputProps {
  onSubmit: (data: URLInputFormData) => void;
  isLoading?: boolean;
}

const analysisTypeOptions: SelectOption[] = [
  { value: 'complete-seo-audit', label: 'Complete SEO Audit' },
  { value: 'content-analysis', label: 'Content Analysis Focus' },
  { value: 'technical-seo', label: 'Technical SEO Audit' },
  { value: 'competitor-analysis', label: 'Competitor Analysis' },
  { value: 'local-seo', label: 'Local SEO Analysis' },
  { value: 'custom', label: 'Custom Analysis' },
];

const analysisDescriptions: Record<AnalysisType, string> = {
  'complete-seo-audit': 'Comprehensive analysis covering all SEO aspects including technical, content, and performance factors.',
  'content-analysis': 'Deep dive into content quality, keyword optimization, readability, and content strategy.',
  'technical-seo': 'Focus on site structure, crawlability, page speed, mobile-friendliness, and technical issues.',
  'competitor-analysis': 'Compare your site against competitors and identify opportunities for improvement.',
  'local-seo': 'Specialized analysis for local businesses including local listings, reviews, and geo-targeting.',
  'custom': 'Provide your own custom prompt for a tailored analysis based on your specific needs.',
};

export function URLInput({ onSubmit, isLoading = false }: URLInputProps) {
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<URLInputFormData>({
    resolver: zodResolver(urlInputSchema),
    mode: 'onChange',
    defaultValues: {
      analysisType: 'complete-seo-audit',
    },
  });

  const selectedAnalysisType = watch('analysisType');
  
  React.useEffect(() => {
    setShowCustomPrompt(selectedAnalysisType === 'custom');
  }, [selectedAnalysisType]);

  const handleFormSubmit = (data: URLInputFormData) => {
    const formattedData = {
      ...data,
      url: formatUrl(data.url),
    };
    onSubmit(formattedData);
  };

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    if (url && isValidUrl(url)) {
      setValue('url', formatUrl(url), { shouldValidate: true });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-space-900/85 backdrop-blur-xl border border-space-600/30 shadow-2xl ring-1 ring-white/10">
      <CardContent className="space-y-6 p-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-500/30 to-purple-500/30 backdrop-blur-sm rounded-full mb-6 border border-accent-400/40 shadow-lg">
            <Search className="w-7 h-7 text-accent-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Analyze Your Website
          </h2>
          <p className="text-gray-200 text-lg">
            Enter your website URL and choose your analysis type to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* URL Input */}
          <div>
            <Input
              {...register('url')}
              label="Website URL"
              placeholder="https://example.com"
              error={!!errors.url}
              helperText={errors.url?.message}
              onBlur={handleUrlBlur}
              disabled={isLoading}
              className="text-lg"
            />
            <div className="flex items-center mt-2 text-sm text-gray-300">
              <Globe className="w-4 h-4 mr-1" />
              <span>Enter the full URL including https://</span>
            </div>
          </div>

          {/* Analysis Type Selection */}
          <div>
            <Select
              {...register('analysisType')}
              label="Analysis Type"
              options={analysisTypeOptions}
              error={!!errors.analysisType}
              helperText={errors.analysisType?.message}
              disabled={isLoading}
            />
            
            {/* Analysis Description */}
            {selectedAnalysisType && (
              <div className="mt-4 p-5 bg-gradient-to-r from-accent-500/15 to-purple-500/15 backdrop-blur-sm rounded-xl border border-accent-400/30 shadow-inner">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-accent-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-100 leading-relaxed">
                    {analysisDescriptions[selectedAnalysisType]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Custom Prompt */}
          {showCustomPrompt && (
            <div className="animate-slide-up">
              <Textarea
                {...register('customPrompt')}
                label="Custom Analysis Prompt"
                placeholder="Describe what specific aspects you'd like to analyze. For example: 'Focus on e-commerce conversion optimization and product page SEO'..."
                error={!!errors.customPrompt}
                helperText={errors.customPrompt?.message || "Provide specific instructions for your custom analysis"}
                disabled={isLoading}
                rows={4}
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-lg py-5 bg-gradient-to-r from-accent-500 to-purple-500 hover:from-accent-600 hover:to-purple-600 text-white border-0 shadow-2xl hover:shadow-accent-500/25 transform hover:scale-[1.02] transition-all duration-300 font-semibold rounded-xl"
            loading={isLoading}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Starting Analysis...' : 'Start SEO Analysis'}
          </Button>
        </form>

        {/* Tips */}
        <div className="border-t border-space-500/40 pt-6 mt-8">
          <h4 className="text-sm font-semibold text-gray-100 mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2 text-accent-400" />
            Tips for best results:
          </h4>
          <ul className="text-sm text-gray-200 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-accent-400 mt-0.5">•</span>
              <span>Make sure your website is publicly accessible</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent-400 mt-0.5">•</span>
              <span>Choose the analysis type that matches your goals</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent-400 mt-0.5">•</span>
              <span>For custom analysis, be specific about what you want to focus on</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}