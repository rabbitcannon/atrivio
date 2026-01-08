'use client';

import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/cn';

interface PageContentEditorProps {
  /** Initial content as JSON string (Plate format) or undefined for empty editor */
  value?: string;
  /** Called when content changes, receives JSON stringified content */
  onChange?: (jsonContent: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// Default initial value - empty paragraph
const defaultValue: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

// Parse JSON string to Plate value
// Handles both Plate JSON format and legacy plain text/markdown content
function parseValue(jsonString?: string): Value {
  if (!jsonString || jsonString.trim() === '') {
    return defaultValue;
  }

  // Quick check: if it doesn't start with '[', it's not Plate JSON
  const trimmed = jsonString.trim();
  if (!trimmed.startsWith('[')) {
    // Convert plain text/markdown to Plate format (paragraph per line)
    return convertTextToPlateValue(trimmed);
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as Value;
    }
  } catch {
    // Not valid JSON - convert as plain text (no need to log, this is expected for legacy content)
  }

  // Fallback: convert as plain text
  return convertTextToPlateValue(trimmed);
}

// Convert plain text/markdown to Plate format
function convertTextToPlateValue(text: string): Value {
  const lines = text.split('\n');
  const nodes: Value = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      nodes.push({ type: 'p', children: [{ text: '' }] });
      continue;
    }

    // Detect markdown headings
    if (trimmedLine.startsWith('### ')) {
      nodes.push({ type: 'h3', children: [{ text: trimmedLine.slice(4) }] });
    } else if (trimmedLine.startsWith('## ')) {
      nodes.push({ type: 'h2', children: [{ text: trimmedLine.slice(3) }] });
    } else if (trimmedLine.startsWith('# ')) {
      nodes.push({ type: 'h1', children: [{ text: trimmedLine.slice(2) }] });
    } else {
      // Regular paragraph
      nodes.push({ type: 'p', children: [{ text: trimmedLine }] });
    }
  }

  return nodes.length > 0 ? nodes : defaultValue;
}

export function PageContentEditor({
  value,
  onChange,
  placeholder = 'Start writing... Use "/" for commands',
  className,
  minHeight = '400px',
}: PageContentEditorProps) {
  // Parse initial value from JSON
  const initialValue = React.useMemo(() => parseValue(value), [value]);

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  // Handle content changes
  const handleChange = React.useCallback(
    ({ value: newValue }: { value: Value }) => {
      if (onChange) {
        try {
          const jsonString = JSON.stringify(newValue);
          onChange(jsonString);
        } catch (_e) {}
      }
    },
    [onChange]
  );

  return (
    <TooltipProvider>
      <div className={cn('rounded-lg border bg-background overflow-hidden', className)}>
        <Plate editor={editor} onChange={handleChange}>
          <EditorContainer className="relative" style={{ minHeight }}>
            <Editor
              variant="fullWidth"
              placeholder={placeholder}
              className="min-h-full px-6 py-4"
            />
          </EditorContainer>
        </Plate>
      </div>
    </TooltipProvider>
  );
}
