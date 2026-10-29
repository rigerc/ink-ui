// Inspired by ink-task-list (MIT, privatenumber). Styled with shared tokens.
import React from 'react';
import {Box, Text} from 'ink';
import {Spinner} from './spinner.js';
import {statusVariant} from './status-variants.js';
import {colors, symbols} from '../tokens.js';

export type TaskState = 'pending' | 'running' | 'success' | 'warning' | 'error';

type TaskProps = {
  label: string;
  state?: TaskState;
  /** When false, nested task details remain hidden. */
  expanded?: boolean;
  /** Allow deterministic terminal output and motion opt-out. */
  animate?: boolean;
  children?: React.ReactNode;
};

const taskAppearance = (state: Exclude<TaskState, 'running'>) =>
  state === 'pending' ? {icon: symbols.pending, color: colors.pending} : statusVariant(state);

export const Task = ({
  label,
  state = 'pending',
  expanded = true,
  animate = true,
  children,
}: TaskProps) => (
  <Box flexDirection="column">
    <Box gap={1}>
      {state === 'running' ? (
        <Spinner animate={animate} color={colors.info} />
      ) : (
        <Text color={taskAppearance(state).color}>{taskAppearance(state).icon}</Text>
      )}
      <Text bold={state === 'running'}>{label}</Text>
    </Box>
    {expanded && children ? (
      <Box flexDirection="column" marginLeft={2}>
        {children}
      </Box>
    ) : null}
  </Box>
);

export const TaskList = ({children}: {children: React.ReactNode}) => (
  <Box flexDirection="column">{children}</Box>
);
