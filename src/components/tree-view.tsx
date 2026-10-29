// Hierarchical flattening and branch connectors inspired by @matthesketh/ink-tree (MIT).
// Presentational: the host owns cursor and expand/collapse keys.
import React, {useMemo} from 'react';
import {Box, Text} from 'ink';
import {VirtualList} from './virtual-list.js';
import {SelectableRow} from './selectable-row.js';
import {colors} from '../tokens.js';

export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
  data?: unknown;
};

export type FlatTreeNode = {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  isLast: boolean;
  /** True where an ancestor has a later sibling to connect to. */
  ancestorHasNext: boolean[];
};

/** Only expanded descendants are included; the output order matches display order. */
export const flattenTree = (
  nodes: readonly TreeNode[],
  expandedIds: ReadonlySet<string> = new Set(),
): FlatTreeNode[] => {
  const output: FlatTreeNode[] = [];

  const walk = (
    siblings: readonly TreeNode[],
    depth: number,
    ancestors: boolean[],
    visiting: Set<TreeNode>,
  ) => {
    siblings.forEach((node, index) => {
      // Skip cyclic references rather than recursing indefinitely.
      if (visiting.has(node)) return;
      const isLast = index === siblings.length - 1;
      const hasChildren = Boolean(node.children?.length);
      const expanded = hasChildren && expandedIds.has(node.id);
      output.push({node, depth, hasChildren, expanded, isLast, ancestorHasNext: ancestors});

      if (expanded) {
        visiting.add(node);
        walk(node.children!, depth + 1, depth === 0 ? [] : [...ancestors, !isLast], visiting);
        visiting.delete(node);
      }
    });
  };

  walk(nodes, 0, [], new Set());

  return output;
};

type TreeViewProps = {
  nodes: TreeNode[];
  expandedIds?: ReadonlySet<string>;
  selectedId?: string;
  maxVisible?: number;
  ascii?: boolean;
  /** Indentation in cells between hierarchy levels. */
  indent?: number;
  renderNode?: (node: TreeNode, selected: boolean, expanded: boolean) => React.ReactNode;
  emptyText?: string;
};

export const TreeView = ({
  nodes,
  expandedIds = new Set<string>(),
  selectedId,
  maxVisible,
  ascii = false,
  indent = 3,
  renderNode,
  emptyText = 'No items',
}: TreeViewProps) => {
  const flat = useMemo(() => flattenTree(nodes, expandedIds), [nodes, expandedIds]);
  const selectedIndex = flat.findIndex((row) => row.node.id === selectedId);
  const cell = Math.max(2, Math.floor(indent) || 3);

  if (flat.length === 0) return <Text color={colors.muted}>{emptyText}</Text>;

  return (
    <VirtualList
      items={flat}
      height={maxVisible ?? flat.length}
      selectedIndex={selectedIndex}
      getKey={(row) => row.node.id}
      showIndicator={maxVisible !== undefined}
      renderItem={(row) => {
        const prefix =
          row.ancestorHasNext
            .map((more) => (more ? (ascii ? '|' : '│') + ' '.repeat(cell - 1) : ' '.repeat(cell)))
            .join('') +
          (row.depth > 0
            ? (ascii ? (row.isLast ? '`--' : '+--') : row.isLast ? '└──' : '├──') + ' '
            : '');

        const glyph = row.hasChildren
          ? row.expanded
            ? ascii
              ? 'v'
              : '▾'
            : ascii
              ? '>'
              : '▸'
          : ascii
            ? '-'
            : '·';

        const selected = row.node.id === selectedId;

        return (
          <SelectableRow active={selected} indent={0}>
            <Box flexShrink={0}>
              <Text color={colors.muted}>{prefix + glyph + ' '}</Text>
            </Box>
            {renderNode ? (
              renderNode(row.node, selected, row.expanded)
            ) : (
              <Text bold={selected}>{row.node.label}</Text>
            )}
          </SelectableRow>
        );
      }}
    />
  );
};
