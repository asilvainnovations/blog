import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/types';

interface BlockRendererProps {
  block: ContentBlock;
  index: number;
}

export function BlockRenderer({ block, index }: BlockRendererProps) {
  const blockId = `heading-${index}`;

  switch (block.type) {
    case 'paragraph':
      return (
        <p
          id={blockId}
          className="mb-6 text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.content as string }}
        />
      );

    case 'heading': {
      const level = block.metadata?.level || 2;
      const headingClasses = {
        1: 'text-4xl font-bold mb-6 mt-12',
        2: 'text-3xl font-bold mb-5 mt-10',
        3: 'text-2xl font-semibold mb-4 mt-8',
        4: 'text-xl font-semibold mb-3 mt-6',
        5: 'text-lg font-medium mb-3 mt-5',
        6: 'text-base font-medium mb-2 mt-4',
      };
      const className = cn('text-slate-900', headingClasses[level as keyof typeof headingClasses]);
      const content = block.content as string;

      switch (level) {
        case 1: return <h1 id={blockId} className={className}>{content}</h1>;
        case 2: return <h2 id={blockId} className={className}>{content}</h2>;
        case 3: return <h3 id={blockId} className={className}>{content}</h3>;
        case 4: return <h4 id={blockId} className={className}>{content}</h4>;
        case 5: return <h5 id={blockId} className={className}>{content}</h5>;
        case 6: return <h6 id={blockId} className={className}>{content}</h6>;
        default: return <h2 id={blockId} className={className}>{content}</h2>;
      }
    }

    case 'image':
      const imageMetadata = block.metadata as { alt?: string; caption?: string; alignment?: string; size?: string };
      const alignmentClasses = {
        left: 'float-left mr-6 mb-4 max-w-sm',
        center: 'mx-auto',
        right: 'float-right ml-6 mb-4 max-w-sm',
      };
      const sizeClasses = {
        small: 'max-w-sm',
        medium: 'max-w-lg',
        large: 'max-w-2xl',
        full: 'w-full',
      };

      return (
        <figure
          id={blockId}
          className={cn(
            'my-8',
            alignmentClasses[imageMetadata.alignment as keyof typeof alignmentClasses],
            sizeClasses[imageMetadata.size as keyof typeof sizeClasses]
          )}
        >
          <img
            src={block.content as string}
            alt={imageMetadata.alt || ''}
            className="w-full rounded-lg"
          />
          {imageMetadata.caption && (
            <figcaption className="text-center text-sm text-slate-500 mt-2">
              {imageMetadata.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'video':
      const videoMetadata = block.metadata as { provider?: string; title?: string };
      const videoUrl = block.content as string;
      let embedUrl = videoUrl;

      // Convert video URLs to embed URLs
      if (videoMetadata.provider === 'youtube') {
        const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
        embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
      } else if (videoMetadata.provider === 'vimeo') {
        const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : videoUrl;
      }

      return (
        <div id={blockId} className="my-8">
          <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-slate-900">
            <iframe
              src={embedUrl}
              title={videoMetadata.title || 'Video'}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {videoMetadata.title && (
            <p className="text-center text-sm text-slate-500 mt-2">
              {videoMetadata.title}
            </p>
          )}
        </div>
      );

    case 'quote':
      const quoteMetadata = block.metadata as { author?: string; source?: string };
      return (
        <blockquote
          id={blockId}
          className="my-8 pl-6 border-l-4 border-blue-500 italic"
        >
          <p className="text-xl text-slate-700 mb-4">{block.content as string}</p>
          {(quoteMetadata.author || quoteMetadata.source) && (
            <footer className="text-sm text-slate-500 not-italic">
              — {quoteMetadata.author}
              {quoteMetadata.source && `, ${quoteMetadata.source}`}
            </footer>
          )}
        </blockquote>
      );

    case 'code':
      const codeMetadata = block.metadata as { language?: string; filename?: string; showLineNumbers?: boolean };
      const lines = (block.content as string).split('\n');

      return (
        <div id={blockId} className="my-8 rounded-lg overflow-hidden bg-slate-900">
          {codeMetadata.filename && (
            <div className="px-4 py-2 bg-slate-800 text-slate-400 text-sm border-b border-slate-700">
              {codeMetadata.filename}
            </div>
          )}
          <pre className="p-4 overflow-x-auto">
            <code className={`language-${codeMetadata.language || 'text'} text-sm text-slate-300`}>
              {codeMetadata.showLineNumbers ? (
                lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell text-right pr-4 text-slate-600 select-none">
                      {i + 1}
                    </span>
                    <span className="table-cell">{line}</span>
                  </div>
                ))
              ) : (
                block.content as string
              )}
            </code>
          </pre>
        </div>
      );

    case 'callout':
      const calloutMetadata = block.metadata as { type?: string; title?: string };
      const calloutStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        tip: 'bg-purple-50 border-purple-200 text-purple-800',
      };
      const calloutIcons = {
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        error: '❌',
        tip: '💡',
      };

      return (
        <div
          id={blockId}
          className={cn(
            'my-8 p-6 rounded-lg border',
            calloutStyles[calloutMetadata.type as keyof typeof calloutStyles] || calloutStyles.info
          )}
        >
          {calloutMetadata.title && (
            <div className="flex items-center gap-2 font-semibold mb-2">
              <span>{calloutIcons[calloutMetadata.type as keyof typeof calloutIcons] || 'ℹ️'}</span>
              {calloutMetadata.title}
            </div>
          )}
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content as string }}
          />
        </div>
      );

    case 'table': {
      const tableContent = (typeof block.content === 'object' && block.content !== null && !Array.isArray(block.content)) 
        ? block.content as { headers: string[]; rows: string[][] } 
        : { headers: [], rows: [] };
      const tableMetadata = block.metadata as { hasHeader?: boolean; caption?: string };

      return (
        <div id={blockId} className="my-8 overflow-x-auto">
          <table className="w-full border-collapse">
            {tableMetadata.hasHeader !== false && (
              <thead>
                <tr className="bg-slate-100">
                  {tableContent.headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border border-slate-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableContent.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-slate-700 border border-slate-200"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {tableMetadata.caption && (
            <caption className="caption-bottom mt-2 text-sm text-slate-500 text-center">
              {tableMetadata.caption}
            </caption>
          )}
        </div>
      );
    }

    case 'accordion': {
      const accordionContent = Array.isArray(block.content) ? block.content as { title: string; content: string }[] : [];

      return (
        <div id={blockId} className="my-8 space-y-2">
          {accordionContent.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-slate-200 bg-white"
            >
              <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-slate-900">
                {item.title}
                <span className="transition group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="px-4 pb-4 text-slate-700">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
              </div>
            </details>
          ))}
        </div>
      );
    }

    case 'divider':
      return <hr id={blockId} className="my-8 border-slate-200" />;

    case 'list': {
      const listContent = Array.isArray(block.content) ? block.content as string[] : [];
      const listMetadata = block.metadata as { ordered?: boolean };
      const ListTag = listMetadata.ordered ? 'ol' : 'ul';

      return (
        <ListTag
          id={blockId}
          className={cn(
            'my-6 ml-6',
            listMetadata.ordered ? 'list-decimal' : 'list-disc'
          )}
        >
          {listContent.map((item, i) => (
            <li key={i} className="mb-2 text-slate-700">
              {item}
            </li>
          ))}
        </ListTag>
      );
    }

    case 'checklist': {
      const checklistContent = Array.isArray(block.content) ? block.content as { text: string; checked: boolean }[] : [];

      return (
        <ul id={blockId} className="my-6 space-y-2">
          {checklistContent.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={item.checked}
                readOnly
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span className={cn('text-slate-700', item.checked && 'line-through text-slate-400')}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    case 'embed':
      return (
        <div
          id={blockId}
          className="my-8"
          dangerouslySetInnerHTML={{ __html: block.content as string }}
        />
      );

    default:
      return null;
  }
}
