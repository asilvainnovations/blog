import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Type,
  Heading1,
  Image as ImageIcon,
  Quote,
  Code,
  List,
  CheckSquare,
  Table,
  Video,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { ContentBlock, BlockType } from '@/types';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  readOnly?: boolean;
}

const blockTypes: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'paragraph', label: 'Paragraph', icon: Type },
  { type: 'heading', label: 'Heading', icon: Heading1 },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'code', label: 'Code', icon: Code },
  { type: 'callout', label: 'Callout', icon: AlertCircle },
  { type: 'table', label: 'Table', icon: Table },
  { type: 'list', label: 'List', icon: List },
  { type: 'checklist', label: 'Checklist', icon: CheckSquare },
  { type: 'divider', label: 'Divider', icon: Type },
];

export function BlockEditor({ blocks, onChange, readOnly = false }: BlockEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addBlock = (type: BlockType, index?: number) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: '',
      order: index !== undefined ? index : blocks.length,
    };

    if (type === 'heading') {
      newBlock.metadata = { level: 2 };
    }

    if (type === 'image') {
      newBlock.metadata = { alt: '', caption: '', alignment: 'center', size: 'large' };
    }

    if (type === 'callout') {
      newBlock.metadata = { type: 'info', title: '' };
    }

    if (type === 'code') {
      newBlock.metadata = { language: 'javascript', showLineNumbers: false };
    }

    if (type === 'quote') {
      newBlock.metadata = { author: '', source: '' };
    }

    if (type === 'video') {
      newBlock.metadata = { provider: 'youtube', title: '' };
    }

    if (type === 'table') {
      newBlock.content = { headers: ['Column 1', 'Column 2'], rows: [['', '']] };
      newBlock.metadata = { hasHeader: true };
    }

    if (type === 'list') {
      newBlock.content = ['Item 1'];
      newBlock.metadata = { ordered: false };
    }

    if (type === 'checklist') {
      newBlock.content = [{ text: 'Task 1', checked: false }];
    }

    const newBlocks = [...blocks];
    if (index !== undefined) {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    // Reorder blocks
    newBlocks.forEach((block, i) => {
      block.order = i;
    });

    onChange(newBlocks);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      newBlocks.forEach((block, i) => {
        block.order = i;
      });
      onChange(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      newBlocks.forEach((block, i) => {
        block.order = i;
      });
      onChange(newBlocks);
    }
  };

  const renderBlockControls = (block: ContentBlock) => (
    <div className="absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => moveBlock(block.id, 'up')}
        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
        disabled={block.order === 0}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        onClick={() => moveBlock(block.id, 'down')}
        className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
        disabled={block.order === blocks.length - 1}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        onClick={() => removeBlock(block.id)}
        className="p-1 rounded hover:bg-red-100 text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderBlock = (block: ContentBlock) => {
    const isSelected = selectedBlock === block.id;

    const wrapperClass = cn(
      'relative group rounded-lg border-2 transition-all',
      isSelected
        ? 'border-blue-500 bg-blue-50/50'
        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
    );

    if (block.type === 'heading') {
      const level = (block.metadata?.level as number) || 2;
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Select
                value={String(level)}
                onValueChange={(v) =>
                  updateBlock(block.id, { metadata: { ...block.metadata, level: parseInt(v) } })
                }
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={block.content as string}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter heading..."
              className="text-xl font-bold border-0 bg-transparent focus-visible:ring-0 p-0"
            />
          </div>
        </div>
      );
    }

    if (block.type === 'paragraph') {
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className="p-4">
            <Textarea
              value={block.content as string}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter paragraph text..."
              className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
            />
          </div>
        </div>
      );
    }

    if (block.type === 'image') {
      const imgMeta = block.metadata as { alt?: string; caption?: string; alignment?: string; size?: string };
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className="p-4 space-y-3">
            <Input
              value={block.content as string}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Image URL..."
            />
            {block.content && (
              <img
                src={block.content as string}
                alt={imgMeta.alt || ''}
                className="max-h-64 object-contain rounded-lg"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={imgMeta.alt || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...imgMeta, alt: e.target.value },
                  })
                }
                placeholder="Alt text..."
              />
              <Input
                value={imgMeta.caption || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...imgMeta, caption: e.target.value },
                  })
                }
                placeholder="Caption..."
              />
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'quote') {
      const quoteMeta = block.metadata as { author?: string; source?: string };
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className="p-4 space-y-3">
            <Textarea
              value={block.content as string}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter quote..."
              className="min-h-[80px] resize-none border-l-4 border-blue-500 pl-4 italic"
            />
            <div className="flex gap-3">
              <Input
                value={quoteMeta.author || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...quoteMeta, author: e.target.value },
                  })
                }
                placeholder="Author..."
                className="flex-1"
              />
              <Input
                value={quoteMeta.source || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...quoteMeta, source: e.target.value },
                  })
                }
                placeholder="Source..."
                className="flex-1"
              />
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'code') {
      const codeMeta = block.metadata as { language?: string; filename?: string; showLineNumbers?: boolean };
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className="p-4 space-y-3">
            <div className="flex gap-3">
              <Select
                value={codeMeta.language || 'javascript'}
                onValueChange={(v) =>
                  updateBlock(block.id, {
                    metadata: { ...codeMeta, language: v },
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="bash">Bash</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={codeMeta.filename || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...codeMeta, filename: e.target.value },
                  })
                }
                placeholder="Filename (optional)..."
                className="flex-1"
              />
            </div>
            <Textarea
              value={block.content as string}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Enter code..."
              className="min-h-[150px] resize-none font-mono text-sm bg-slate-900 text-slate-100"
            />
          </div>
        </div>
      );
    }

    if (block.type === 'callout') {
      const calloutMeta = block.metadata as { type?: 'info' | 'warning' | 'success' | 'error' | 'tip'; title?: string };
      const calloutStyles = {
        info: 'bg-blue-50 border-blue-200',
        warning: 'bg-amber-50 border-amber-200',
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        tip: 'bg-purple-50 border-purple-200',
      };
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className={cn('p-4 space-y-3 rounded-lg border', calloutStyles[calloutMeta.type || 'info'])}>
            <div className="flex gap-3">
              <Select
                value={calloutMeta.type || 'info'}
                onValueChange={(v) =>
                  updateBlock(block.id, {
                    metadata: { ...calloutMeta, type: v as any },
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="tip">Tip</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={calloutMeta.title || ''}
                onChange={(e) =>
                  updateBlock(block.id, {
                    metadata: { ...calloutMeta, title: e.target.value },
                  })
                }
                placeholder="Title (optional)..."
                className="flex-1"
              />
            </div>
            <Textarea
              value={block.content as string}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              placeholder="Callout content..."
              className="min-h-[80px] resize-none bg-transparent border-0"
            />
          </div>
        </div>
      );
    }

    if (block.type === 'divider') {
      return (
        <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
          {renderBlockControls(block)}
          <div className="p-4">
            <hr className="border-slate-300" />
          </div>
        </div>
      );
    }

    // Default fallback for other block types
    return (
      <div key={block.id} className={wrapperClass} onClick={() => setSelectedBlock(block.id)}>
        {renderBlockControls(block)}
        <div className="p-4">
          <Label className="text-xs text-slate-500 uppercase mb-2 block">{block.type}</Label>
          <Textarea
            value={typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder={`Enter ${block.type} content...`}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Blocks */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div key={block.id}>
            {renderBlock(block)}
            {/* Add Block Button */}
            <div className="flex justify-center py-2 opacity-0 hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Block
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {blockTypes.map((type) => (
                    <DropdownMenuItem
                      key={type.type}
                      onClick={() => addBlock(type.type, index)}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State / Add First Block */}
      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <p className="text-slate-500 mb-4">Start building your article</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {blockTypes.map((type) => (
                <DropdownMenuItem key={type.type} onClick={() => addBlock(type.type)}>
                  <type.icon className="h-4 w-4 mr-2" />
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
