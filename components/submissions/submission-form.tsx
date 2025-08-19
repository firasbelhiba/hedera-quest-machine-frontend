'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Quest, SubmissionType } from '@/lib/types';
import { QuestService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Upload, Link, FileText, Hash, User } from 'lucide-react';

interface SubmissionFormProps {
  quest: Quest;
  onSubmit: () => void;
  onCancel: () => void;
}

// Dynamic schema based on submission type
const createSubmissionSchema = (type: SubmissionType) => {
  const baseSchema = z.object({
    type: z.literal(type),
  });

  switch (type) {
    case 'url':
      return baseSchema.extend({
        url: z.string().url('Please enter a valid URL'),
      });
    case 'text':
      return baseSchema.extend({
        text: z.string().min(10, 'Text must be at least 10 characters long'),
      });
    case 'transaction-id':
      return baseSchema.extend({
        transactionId: z.string().refine(
          (val) => QuestService.validateTransactionId(val),
          'Invalid transaction ID format (should be like 0.0.123456@1234567890.123456789)'
        ),
      });
    case 'account-id':
      return baseSchema.extend({
        accountId: z.string().refine(
          (val) => QuestService.validateHederaAccountId(val),
          'Invalid Hedera account ID format (should be like 0.0.123456)'
        ),
      });
    case 'file':
      return baseSchema.extend({
        fileName: z.string().min(1, 'Please provide a file name'),
      });
    default:
      return baseSchema;
  }
};

export function SubmissionForm({ quest, onSubmit, onCancel }: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = createSubmissionSchema(quest.submissionType || 'text');
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: quest.submissionType || 'text' }
  });

  const submitData = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build content explicitly to satisfy SubmissionContent typing
      const content: any = { type: (data as any).type };
      if (quest.submissionType === 'url') content.url = (data as any).url;
      if (quest.submissionType === 'text') content.text = (data as any).text;
      if (quest.submissionType === 'transaction-id') content.transactionId = (data as any).transactionId;
      if (quest.submissionType === 'account-id') content.accountId = (data as any).accountId;
      if (quest.submissionType === 'file') content.fileName = (data as any).fileName;

      await QuestService.submitQuest(String(quest.id), 'current-user-id', content);
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionIcon = (type: SubmissionType) => {
    switch (type) {
      case 'url':
        return Link;
      case 'text':
        return FileText;
      case 'file':
        return Upload;
      case 'transaction-id':
        return Hash;
      case 'account-id':
        return User;
      default:
        return FileText;
    }
  };

  const SubmissionIcon = getSubmissionIcon(quest.submissionType || 'text');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SubmissionIcon className="w-5 h-5" />
          Submit Quest: {quest.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quest Requirements */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Requirements</h4>
          <ul className="space-y-1">
            {quest.requirements?.map((req, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Submission Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Submission Instructions
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {quest.submissionInstructions}
          </p>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit(submitData)} className="space-y-4">
          {quest.submissionType === 'url' && (
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...(register as any)('url')}
              />
              {(errors as any).url && (
                <p className="text-sm text-destructive mt-1">{(errors as any).url.message}</p>
              )}
            </div>
          )}

          {quest.submissionType === 'text' && (
            <div>
              <Label htmlFor="text">Your Response</Label>
              <Textarea
                id="text"
                placeholder="Enter your detailed response..."
                rows={6}
                {...(register as any)('text')}
              />
              {(errors as any).text && (
                <p className="text-sm text-destructive mt-1">{(errors as any).text.message}</p>
              )}
            </div>
          )}

          {quest.submissionType === 'transaction-id' && (
            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                placeholder="0.0.123456@1234567890.123456789"
                {...(register as any)('transactionId')}
              />
              {(errors as any).transactionId && (
                <p className="text-sm text-destructive mt-1">{(errors as any).transactionId.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                You can find this in HashScan or your wallet transaction history
              </p>
            </div>
          )}

          {quest.submissionType === 'account-id' && (
            <div>
              <Label htmlFor="accountId">Hedera Account ID</Label>
              <Input
                id="accountId"
                placeholder="0.0.123456"
                {...(register as any)('accountId')}
              />
              {(errors as any).accountId && (
                <p className="text-sm text-destructive mt-1">{(errors as any).accountId.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Format: 0.0.XXXXXX (found in your wallet or HashScan)
              </p>
            </div>
          )}

          {quest.submissionType === 'file' && (
            <div>
              <Label htmlFor="fileName">File Description</Label>
              <Input
                id="fileName"
                placeholder="Describe your uploaded file"
                {...(register as any)('fileName')}
              />
              {(errors as any).fileName && (
                <p className="text-sm text-destructive mt-1">{(errors as any).fileName.message}</p>
              )}
              <div className="mt-2 p-4 border-2 border-dashed rounded-lg text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  File upload functionality would be implemented here
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quest'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}