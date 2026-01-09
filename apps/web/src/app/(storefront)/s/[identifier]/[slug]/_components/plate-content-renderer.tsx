import { cn } from '@/lib/utils/cn';

interface PlateNode {
  type?: string;
  text?: string;
  children?: PlateNode[];
  url?: string;
  checked?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  // Mark properties
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  // Other properties
  [key: string]: unknown;
}

interface PlateContentRendererProps {
  content: string;
  className?: string;
}

export function PlateContentRenderer({ content, className }: PlateContentRendererProps) {
  let nodes: PlateNode[] = [];

  try {
    // Try to parse as JSON (Plate format)
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      nodes = parsed;
    }
  } catch {
    // If not JSON, treat as plain text
    return (
      <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
        <p>{content}</p>
      </div>
    );
  }

  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      {nodes.map((node, index) => (
        <RenderNode key={index} node={node} />
      ))}
    </div>
  );
}

function RenderNode({ node }: { node: PlateNode }) {
  // Text node (leaf)
  if (node.text !== undefined) {
    return <RenderText node={node} />;
  }

  const children = node.children?.map((child, index) => (
    <RenderNode key={index} node={child} />
  ));

  const alignClass = node.align ? getAlignClass(node.align) : '';

  switch (node.type) {
    case 'p':
      return <p className={alignClass}>{children}</p>;

    case 'h1':
      return <h1 className={alignClass}>{children}</h1>;

    case 'h2':
      return <h2 className={alignClass}>{children}</h2>;

    case 'h3':
      return <h3 className={alignClass}>{children}</h3>;

    case 'h4':
      return <h4 className={alignClass}>{children}</h4>;

    case 'h5':
      return <h5 className={alignClass}>{children}</h5>;

    case 'h6':
      return <h6 className={alignClass}>{children}</h6>;

    case 'blockquote':
      return <blockquote className={alignClass}>{children}</blockquote>;

    case 'hr':
      return <hr />;

    case 'ul':
      return <ul className={alignClass}>{children}</ul>;

    case 'ol':
      return <ol className={alignClass}>{children}</ol>;

    case 'li':
      return <li>{children}</li>;

    case 'lic': // List item content
      return <>{children}</>;

    case 'action_item': // Checkbox list item
      return (
        <li className="flex items-start gap-2 list-none">
          <input
            type="checkbox"
            checked={node.checked ?? false}
            readOnly
            className="mt-1"
          />
          <span>{children}</span>
        </li>
      );

    case 'a':
    case 'link':
      return (
        <a
          href={node.url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      );

    case 'code_block':
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{children}</code>
        </pre>
      );

    case 'code_line':
      return <>{children}{'\n'}</>;

    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-border">
            <tbody>{children}</tbody>
          </table>
        </div>
      );

    case 'tr':
      return <tr>{children}</tr>;

    case 'th':
      return (
        <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
          {children}
        </th>
      );

    case 'td':
      return (
        <td className="border border-border px-4 py-2">{children}</td>
      );

    case 'img':
    case 'image':
      return (
        <figure>
          <img
            src={node.url as string}
            alt={(node.alt as string) || ''}
            className="max-w-full h-auto rounded-lg"
          />
          {typeof node.caption === 'string' && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {node.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'video':
    case 'media_embed':
      return (
        <div className="aspect-video">
          <iframe
            src={node.url as string}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      );

    case 'callout':
      return (
        <div className="bg-muted border-l-4 border-primary p-4 rounded-r-lg my-4">
          {children}
        </div>
      );

    case 'toggle':
      return (
        <details className="my-2">
          <summary className="cursor-pointer font-medium">{children}</summary>
        </details>
      );

    case 'column_group':
      return (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${(node.children?.length || 1)}, 1fr)` }}>
          {children}
        </div>
      );

    case 'column':
      return <div>{children}</div>;

    case 'equation':
    case 'inline_equation':
      // For math equations, just show the raw latex for now
      return <code className="bg-muted px-1 rounded">{node.value as string || children}</code>;

    case 'date':
      return (
        <time className="text-muted-foreground">
          {node.date as string || children}
        </time>
      );

    default:
      // Unknown type, try to render children
      if (children) {
        return <div>{children}</div>;
      }
      return null;
  }
}

function RenderText({ node }: { node: PlateNode }) {
  let text: React.ReactNode = node.text || '';

  // Apply marks
  if (node.bold) {
    text = <strong>{text}</strong>;
  }
  if (node.italic) {
    text = <em>{text}</em>;
  }
  if (node.underline) {
    text = <u>{text}</u>;
  }
  if (node.strikethrough) {
    text = <s>{text}</s>;
  }
  if (node.code) {
    text = <code className="bg-muted px-1 py-0.5 rounded text-sm">{text}</code>;
  }
  if (node.subscript) {
    text = <sub>{text}</sub>;
  }
  if (node.superscript) {
    text = <sup>{text}</sup>;
  }

  return <>{text}</>;
}

function getAlignClass(align: string): string {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
    default:
      return '';
  }
}
