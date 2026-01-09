'use client';

import { Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface VerificationInstructionsProps {
  verification: {
    method: string;
    recordName: string;
    recordValue: string;
    instructions: string;
  };
}

export function VerificationInstructions({ verification }: VerificationInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        className="p-0 h-auto text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <>
            <ChevronUp className="mr-1 h-3 w-3" />
            Hide DNS Instructions
          </>
        ) : (
          <>
            <ChevronDown className="mr-1 h-3 w-3" />
            Show DNS Instructions
          </>
        )}
      </Button>

      {isOpen && (
        <div className="mt-2 bg-muted p-3 rounded-lg text-xs space-y-2">
          <p className="text-muted-foreground">{verification.instructions}</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <code className="bg-background px-1 py-0.5 rounded">{verification.recordName}</code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(verification.recordName, 'name')}
              >
                {copiedField === 'name' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-muted-foreground">Value: </span>
                <code className="bg-background px-1 py-0.5 rounded break-all">{verification.recordValue}</code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => copyToClipboard(verification.recordValue, 'value')}
              >
                {copiedField === 'value' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
