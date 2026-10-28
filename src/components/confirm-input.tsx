// Ported from @inkjs/ui (MIT, Vadim Demedes — https://github.com/vadimdemedes/ink-ui)
// and adapted to @rigerc/ink-ui tokens and conventions.
import React, {useEffect, useState} from 'react';
import {Text, useInput} from 'ink';
import {resolveWidgetColor, type WidgetColor} from '../widget-color.js';

type ConfirmInputProps = {
  // Which choice Enter selects, and which letter is shown capitalised.
  defaultChoice?: 'confirm' | 'cancel';
  onConfirm?: () => void;
  onCancel?: () => void;
  isDisabled?: boolean;
  /** Opt in to arrows changing the choice submitted by Enter. */
  arrowKeys?: boolean;
  /** Hint foreground; null uses the terminal default. */
  color?: WidgetColor;
  dimColor?: boolean;
};

export const ConfirmInput = ({
  defaultChoice = 'confirm',
  onConfirm,
  onCancel,
  isDisabled = false,
  arrowKeys = false,
  color,
  dimColor = true,
}: ConfirmInputProps) => {
  const [choice, setChoice] = useState(defaultChoice);
  useEffect(() => setChoice(defaultChoice), [defaultChoice]);
  const selectedChoice = arrowKeys ? choice : defaultChoice;

  useInput(
    (input, key) => {
      if (input.toLowerCase() === 'y') {
        onConfirm?.();

        return;
      }

      if (input.toLowerCase() === 'n') {
        onCancel?.();

        return;
      }

      if (arrowKeys && (key.leftArrow || key.upArrow)) {
        setChoice('cancel');

        return;
      }

      if (arrowKeys && (key.rightArrow || key.downArrow)) {
        setChoice('confirm');

        return;
      }

      if (key.return) {
        if (selectedChoice === 'confirm') onConfirm?.();
        else onCancel?.();
      }
    },
    {isActive: !isDisabled},
  );

  // The selected choice is capitalised — a shape/case cue, not a colour one.
  const hint = selectedChoice === 'confirm' ? '(Y/n)' : '(y/N)';

  return (
    <Text color={resolveWidgetColor(color, undefined)} dimColor={dimColor}>
      {hint}
    </Text>
  );
};
