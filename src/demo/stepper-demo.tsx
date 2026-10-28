import React, { useState } from "react"
import { Box, Text, useInput } from "ink"
import {
  Step,
  Stepper,
  StepperNavigation,
  StepperProgress,
  StatusMessage,
  colors,
  spacing,
  symbols,
  useStepper,
} from "../index.js"

type DemoProps = { focused: boolean }
type Result = "completed" | "cancelled" | null

/**
 * The gallery owns Escape to leave the preview. Use b as its explicit
 * step-back shortcut so the Stepper never steals the host's Escape key.
 */
const StepBackKey = ({ focused }: DemoProps) => {
  const { goBack, isValidating } = useStepper()
  useInput(
    (input) => {
      if (input === "b" && !isValidating) void goBack()
    },
    { isActive: focused },
  )
  return null
}

export const StepperDemo = ({ focused }: DemoProps) => {
  const [ready, setReady] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [ascii, setAscii] = useState(false)
  const [vertical, setVertical] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [run, setRun] = useState(0)

  useInput(
    (input) => {
      if (input === "r" && result) {
        setResult(null)
        setReady(false)
        setStepIndex(0)
        setRun((previous) => previous + 1)
        return
      }
      if (result) return
      if (input === "a") setAscii((value) => !value)
      if (input === "v") setVertical((value) => !value)
      if (input === " " && stepIndex === 0) setReady((value) => !value)
    },
    { isActive: focused },
  )

  return (
    <Box flexDirection="column" gap={spacing.xs}>
      <Text dimColor>
        {ascii ? "ASCII" : "Unicode"} progress · {vertical ? "vertical" : "horizontal"} layout
      </Text>
      {result ? (
        <Box flexDirection="column" gap={spacing.xs}>
          <StatusMessage variant={result === "completed" ? "success" : "warning"}>
            Wizard {result}.
          </StatusMessage>
          <Text dimColor>r restart · Esc return to gallery</Text>
        </Box>
      ) : (
        <Stepper
          key={run}
          keyboardNav={focused}
          onStepChange={setStepIndex}
          onComplete={() => setResult("completed")}
          onCancel={() => setResult("cancelled")}
          renderProgress={(props) => (
            <StepperProgress
              {...props}
              orientation={vertical ? "vertical" : "horizontal"}
              ascii={ascii}
            />
          )}
        >
          <Step key="details" name="Details" canProceed={async () => ready}>
            <Box flexDirection="column">
              <Text>
                {ready ? symbols.success : symbols.pending} Details {ready ? "ready" : "not ready"}
              </Text>
              <Text dimColor>Press space to toggle readiness; Enter is guarded.</Text>
              <StepperNavigation />
              <StepBackKey focused={focused} />
            </Box>
          </Step>
          <Step key="validation" name="Validation" canProceed={async () => true}>
            <Box flexDirection="column">
              <Text>Async validation passed. Continue to review.</Text>
              <StepperNavigation />
              <StepBackKey focused={focused} />
            </Box>
          </Step>
          <Step key="review" name="Review">
            <Box flexDirection="column">
              <Text color={colors.success}>Ready to complete the wizard.</Text>
              <StepperNavigation />
              <StepBackKey focused={focused} />
            </Box>
          </Step>
        </Stepper>
      )}
      {!result && (
        <Text dimColor>
          Enter next · b previous/cancel · space ready · a ASCII · v layout · Esc gallery
        </Text>
      )}
    </Box>
  )
}
