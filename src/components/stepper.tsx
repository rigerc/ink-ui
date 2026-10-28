import React, {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import { Box, Text, useInput } from "ink"
import { useTheme } from "../theme/context.js"

/** Inspired by the MIT-licensed Stepper in rigerc/nosey. */
export interface StepContext {
  currentStep: number
  totalSteps: number
  isFirst: boolean
  isLast: boolean
  isValidating: boolean
  /** Enabled only when the parent opts into the Stepper's Enter shortcut. */
  keyboardNav: boolean
  goNext: () => Promise<void>
  goBack: () => Promise<void>
  /** Jump without canProceed, but still run onExitStep. */
  goTo: (index: number) => Promise<void>
  cancel: () => void
}

export interface StepProps {
  name: string
  canProceed?: boolean | (() => boolean | Promise<boolean>)
  children: ReactNode | ((context: StepContext) => ReactNode)
}

/** Marker component: only the active Step's content is mounted. */
export const Step = (_props: StepProps): null => null

export interface StepperProps {
  /** Step elements or fragments of Steps; key conditional/reorderable Steps. */
  children: ReactNode
  onComplete: () => void
  onCancel?: () => void
  onStepChange?: (index: number) => void
  /** Returning false blocks leaving the current step. */
  onExitStep?: (index: number) => void | boolean | Promise<void | boolean>
  onEnterStep?: (index: number) => void
  onError?: (cause: unknown) => void
  /** Controlled, zero-based position. */
  step?: number
  initialStep?: number
  /**
   * Listen to Enter to advance. Off by default: Ink broadcasts input to all
   * active useInput listeners, and nested inputs may already own Enter.
   * Esc/backspace/q always belong to the host's useAppKeys.
   */
  keyboardNav?: boolean
  showProgress?: boolean
  renderProgress?: (props: StepperProgressProps) => ReactNode
}

export interface StepperProgressProps {
  steps: readonly { id: string; name: string }[]
  /** steps.length means all steps have been completed. */
  currentStep: number
  orientation?: "horizontal" | "vertical"
}

export const StepperProgress = ({
  steps,
  currentStep,
  orientation = "horizontal",
}: StepperProgressProps) => {
  const theme = useTheme()

  return (
    <Box
      flexDirection={orientation === "vertical" ? "column" : "row"}
      flexWrap="wrap"
      columnGap={2}
    >
      {steps.map(({ id, name }, index) => {
        const complete = index < currentStep
        const current = index === currentStep
        const marker = complete
          ? theme.symbols.success
          : current
            ? theme.symbols.pointer
            : theme.symbols.pending
        return (
          <Text
            key={id}
            bold={current}
            color={
              theme.color[complete ? "success" : current ? "primary" : "muted"]
            }
            dimColor={theme.mono && !current}
          >
            {marker} {index + 1}. {name}
          </Text>
        )
      })}
    </Box>
  )
}

const StepperContext = createContext<StepContext | null>(null)

export const useStepper = (): StepContext => {
  const context = useContext(StepperContext)
  if (!context) throw new Error("useStepper must be used inside Stepper")
  return context
}

/** Display hints; the host must wire Esc/backspace to goBack itself. */
export const StepperNavigation = () => {
  const { isFirst, isLast, isValidating, keyboardNav } = useStepper()
  const theme = useTheme()
  if (isValidating) {
    return <Text color={theme.color.muted}>Validating{theme.symbols.ellipsis}</Text>
  }
  return (
    <Text color={theme.color.muted}>
      {keyboardNav ? "enter: " + (isLast ? "finish" : "next") + " · " : ""}
      {isFirst ? "back: cancel" : "back: previous"} (host)
    </Text>
  )
}

type IndexedStep = { id: string; element: ReactElement<StepProps> }

const collectSteps = (children: ReactNode, prefix = ""): IndexedStep[] =>
  Children.toArray(children).flatMap((child, index) => {
    if (!isValidElement(child)) {
      throw new Error("Stepper children must be Step elements or fragments")
    }

    const id = prefix + "/" + (child.key ?? index)
    if (child.type === Fragment) {
      return collectSteps((child.props as { children: ReactNode }).children, id)
    }
    if (child.type !== Step) {
      throw new Error("Stepper children must be Step elements or fragments")
    }

    return [{ id, element: child as ReactElement<StepProps> }]
  })

const clamp = (index: number, length: number): number =>
  Math.max(0, Math.min(Number.isFinite(index) ? Math.trunc(index) : 0, length - 1))

export const Stepper = ({
  children,
  onComplete,
  onCancel,
  onStepChange,
  onExitStep,
  onEnterStep,
  onError,
  step,
  initialStep = 0,
  keyboardNav = false,
  showProgress = true,
  renderProgress,
}: StepperProps) => {
  const theme = useTheme()
  const steps = collectSteps(children)
  const [position, setPosition] = useState<{ index: number; id: string | null }>({
    index: initialStep,
    id: null,
  })
  const trackedIndex =
    position.id === null ? -1 : steps.findIndex((item) => item.id === position.id)
  const currentStep = clamp(
    step ?? (trackedIndex < 0 ? position.index : trackedIndex),
    steps.length,
  )
  const active = steps[currentStep]

  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string>()
  const [finished, setFinished] = useState(false)
  const busy = useRef(false)
  const ended = useRef(false)
  const mounted = useRef(true)
  const source = useRef({ id: active?.id, index: currentStep, signature: "" })
  source.current = {
    id: active?.id,
    index: currentStep,
    signature: JSON.stringify(steps.map((item) => item.id)),
  }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Remember the active key, not only its numeric index, across reordering.
  useEffect(() => {
    if (step === undefined && active) {
      setPosition((previous) =>
        previous.id === active.id && previous.index === currentStep
          ? previous
          : { id: active.id, index: currentStep },
      )
    }
  }, [active?.id, currentStep, step])

  const cancel = () => {
    if (busy.current || ended.current || !active) return
    ended.current = true
    setFinished(true)
    onCancel?.()
  }

  const navigate = async (direction: "next" | "back" | number) => {
    if (busy.current || ended.current || !active) return

    const target =
      typeof direction === "number"
        ? clamp(direction, steps.length)
        : direction === "next"
          ? currentStep + 1
          : currentStep - 1
    if (target === currentStep) return

    busy.current = true
    setIsValidating(true)
    setError(undefined)
    const origin = source.current
    const stillCurrent = () =>
      mounted.current &&
      source.current.id === origin.id &&
      source.current.index === origin.index &&
      source.current.signature === origin.signature

    try {
      await Promise.resolve()
      if (!stillCurrent()) return

      if (direction === "next") {
        const guard = active.element.props.canProceed ?? true
        const permitted = typeof guard === "function" ? await guard() : guard
        if (!permitted || !stillCurrent()) return
      }

      if (onExitStep && (await onExitStep(currentStep)) === false) return
      if (!stillCurrent()) return

      if (target < 0 || target >= steps.length) {
        ended.current = true
        setFinished(true)
        if (target < 0) onCancel?.()
        else onComplete()
      } else {
        if (step === undefined) {
          setPosition({ index: target, id: steps[target]!.id })
        }
        onStepChange?.(target)
        onEnterStep?.(target)
      }
    } catch (cause) {
      if (stillCurrent()) {
        setError(cause instanceof Error ? cause.message : String(cause))
        onError?.(cause)
      }
    } finally {
      if (mounted.current) setIsValidating(false)
      busy.current = false
    }
  }

  const context: StepContext = {
    currentStep,
    totalSteps: steps.length,
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1,
    isValidating,
    keyboardNav,
    goNext: () => navigate("next"),
    goBack: () => navigate("back"),
    goTo: (index) => navigate(index),
    cancel,
  }

  // Deliberately never claim Esc, backspace or q from useAppKeys.
  useInput(
    (_input, key) => {
      if (key.return) void context.goNext()
    },
    { isActive: keyboardNav && !finished && !!active && !isValidating },
  )

  if (!active || finished) return null
  const progress: StepperProgressProps = {
    steps: steps.map((item) => ({ id: item.id, name: item.element.props.name })),
    currentStep,
  }
  const content = active.element.props.children

  return (
    <StepperContext.Provider value={context}>
      <Box flexDirection="column" gap={1}>
        {showProgress &&
          (renderProgress ? renderProgress(progress) : <StepperProgress {...progress} />)}
        <Box key={active.id} flexDirection="column">
          {typeof content === "function" ? content(context) : content}
        </Box>
        {error && (
          <Box gap={1}>
            <Text color={theme.color.danger}>{theme.symbols.error}</Text>
            <Text>{error}</Text>
          </Box>
        )}
      </Box>
    </StepperContext.Provider>
  )
}
