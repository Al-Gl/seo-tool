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
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <Search className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analyze Your Website
          </h2>
          <p className="text-gray-500">
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
            <div className="flex items-center mt-2 text-sm text-gray-500">
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
              <div className="mt-3 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-primary-700">
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
            className="w-full text-lg py-4"
            loading={isLoading}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Starting Analysis...' : 'Start SEO Analysis'}
          </Button>
        </form>

        {/* Tips */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Tips for best results:
          </h4>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Make sure your website is publicly accessible</li>
            <li>• Choose the analysis type that matches your goals</li>
            <li>• For custom analysis, be specific about what you want to focus on</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}