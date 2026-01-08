import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type HeadingProps = ComponentPropsWithoutRef<'h1'> & { children?: ReactNode };
type ParagraphProps = ComponentPropsWithoutRef<'p'> & { children?: ReactNode };
type AnchorProps = ComponentPropsWithoutRef<'a'> & { children?: ReactNode; href?: string };
type ListProps = ComponentPropsWithoutRef<'ul'> & { children?: ReactNode };
type ListItemProps = ComponentPropsWithoutRef<'li'> & { children?: ReactNode };
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'> & { children?: ReactNode };
type CodeProps = ComponentPropsWithoutRef<'code'> & { children?: ReactNode };
type PreProps = ComponentPropsWithoutRef<'pre'> & { children?: ReactNode };
type TableProps = ComponentPropsWithoutRef<'table'> & { children?: ReactNode };
type TableHeadProps = ComponentPropsWithoutRef<'thead'> & { children?: ReactNode };
type TableBodyProps = ComponentPropsWithoutRef<'tbody'> & { children?: ReactNode };
type TableRowProps = ComponentPropsWithoutRef<'tr'> & { children?: ReactNode };
type TableHeaderProps = ComponentPropsWithoutRef<'th'> & { children?: ReactNode };
type TableDataProps = ComponentPropsWithoutRef<'td'> & { children?: ReactNode };
type ImageProps = ComponentPropsWithoutRef<'img'> & { src?: string; alt?: string };
type HrProps = ComponentPropsWithoutRef<'hr'>;
type StrongProps = ComponentPropsWithoutRef<'strong'> & { children?: ReactNode };
type EmProps = ComponentPropsWithoutRef<'em'> & { children?: ReactNode };

// Custom components for MDX content
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings with anchor links
    h1: ({ children, ...props }: HeadingProps) => (
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-6" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: HeadingProps) => (
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-10 mb-4 border-b pb-2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: HeadingProps) => (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-3" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: HeadingProps) => (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-2" {...props}>
        {children}
      </h4>
    ),

    // Paragraphs
    p: ({ children, ...props }: ParagraphProps) => (
      <p className="leading-7 [&:not(:first-child)]:mt-4 text-muted-foreground" {...props}>
        {children}
      </p>
    ),

    // Links
    a: ({ href, children, ...props }: AnchorProps) => {
      const isInternal = href?.startsWith('/') || href?.startsWith('#');
      if (isInternal && href) {
        return (
          <Link href={href} className="text-primary underline underline-offset-4 hover:text-primary/80" {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Lists
    ul: ({ children, ...props }: ListProps) => (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: ListProps) => (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: ListItemProps) => (
      <li className="text-muted-foreground" {...props}>
        {children}
      </li>
    ),

    // Blockquotes
    blockquote: ({ children, ...props }: BlockquoteProps) => (
      <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-muted-foreground" {...props}>
        {children}
      </blockquote>
    ),

    // Code
    code: ({ children, ...props }: CodeProps) => (
      <code
        className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, ...props }: PreProps) => (
      <pre
        className="mb-4 mt-6 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm"
        {...props}
      >
        {children}
      </pre>
    ),

    // Tables
    table: ({ children, ...props }: TableProps) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: TableHeadProps) => (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: TableBodyProps) => (
      <tbody {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: TableRowProps) => (
      <tr className="border-b border-border" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: TableHeaderProps) => (
      <th className="px-4 py-3 text-left font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: TableDataProps) => (
      <td className="px-4 py-3 text-muted-foreground" {...props}>
        {children}
      </td>
    ),

    // Images - use Next.js Image component
    img: ({ src, alt }: ImageProps) => {
      if (!src) return null;
      // For external images or screenshots
      if (src.startsWith('http') || src.startsWith('/')) {
        return (
          <span className="block my-6">
            <Image
              src={src}
              alt={alt || ''}
              width={800}
              height={450}
              className="rounded-lg border border-border shadow-sm"
            />
          </span>
        );
      }
      // Fallback for relative paths
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || ''}
          className="rounded-lg border border-border shadow-sm my-6"
        />
      );
    },

    // Horizontal rule
    hr: (props: HrProps) => <hr className="my-8 border-border" {...props} />,

    // Strong and emphasis
    strong: ({ children, ...props }: StrongProps) => (
      <strong className="font-semibold text-foreground" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: EmProps) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),

    ...components,
  };
}
