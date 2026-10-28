import React from "react"
import { Text } from "ink"
import { render } from "ink-testing-library"
import { describe, expect, it, vi } from "vitest"
import {
  Step,
  Stepper,
  StepperNavigation,
  StepperProgress,
  type StepContext,
} from "./stepper.js"
import { ThemeProvider } from "../theme/context.js"

const settle = () => new Promise((resolve) => setTimeout(resolve, 30))

const wizard = (current: { value?: StepContext }, options: {
  onComplete?: () => void
  onCancel?: () => void
  onStepChange?: (index: number) => void
  canProceed?: boolean | (() => boolean | Promise<boolean>)
  onExitStep?: (index: number) => boolean | Promise<boolean>
  onError?: (cause: unknown) => void
  keyboardNav?: boolean
  step?: number
} = {}) => (
  <Stepper
    onComplete={options.onComplete ?? (() => {})}
    onCancel={options.onCancel}
    onStepChange={options.onStepChange}
    onExitStep={options.onExitStep}
    onError={options.onError}
    keyboardNav={options.keyboardNav}
    step={options.step}
  >
    <Step name="Details" canProceed={options.canProceed}>
      {(context) => {
        current.value = context
        return <Text>First page</Text>
      }}
    </Step>
    <Step name="Review">
      {(context) => {
        current.value = context
        return (
          <>
            <Text>Second page</Text>
            <StepperNavigation />
          </>
        )
      }}
    </Step>
  </Stepper>
)

describe("Stepper", () => {
  it("shows the progress and mounts only the active step", () => {
    const current: { value?: StepContext } = {}
    const { lastFrame } = render(wizard(current))
    expect(lastFrame()).toContain("❯ 1. Details")
    expect(lastFrame()).toContain("○ 2. Review")
    expect(lastFrame()).toContain("First page")
    expect(lastFrame()).not.toContain("Second page")
    expect(current.value?.isFirst).toBe(true)
    expect(current.value?.totalSteps).toBe(2)
  })

  it("advances, invokes lifecycle callbacks and completes once", async () => {
    const current: { value?: StepContext } = {}
    const onStepChange = vi.fn()
    const onComplete = vi.fn()
    const onExitStep = vi.fn(() => true)
    const { lastFrame } = render(
      wizard(current, { onComplete, onStepChange, onExitStep }),
    )
    await current.value!.goNext()
    await settle()
    expect(lastFrame()).toContain("Second page")
    expect(lastFrame()).toContain("✓ 1. Details")
    expect(onStepChange).toHaveBeenCalledWith(1)
    expect(onExitStep).toHaveBeenCalledWith(0)

    await current.value!.goNext()
    await settle()
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(lastFrame()).toBe("")
  })

  it("prevents progression when async validation returns false", async () => {
    const current: { value?: StepContext } = {}
    const onExitStep = vi.fn(() => true)
    const { lastFrame } = render(
      wizard(current, {
        canProceed: async () => false,
        onExitStep,
      }),
    )
    await current.value!.goNext()
    await settle()
    expect(lastFrame()).toContain("First page")
    expect(onExitStep).not.toHaveBeenCalled()
  })

  it("reports rejected validation without advancing", async () => {
    const current: { value?: StepContext } = {}
    const onError = vi.fn()
    const { lastFrame } = render(
      wizard(current, {
        canProceed: async () => {
          throw new Error("Invalid details")
        },
        onError,
      }),
    )
    await current.value!.goNext()
    await settle()
    expect(lastFrame()).toContain("Invalid details")
    expect(lastFrame()).toContain("First page")
    expect(onError).toHaveBeenCalledOnce()
  })

  it("respects onExitStep veto and lets goTo skip canProceed", async () => {
    const current: { value?: StepContext } = {}
    const onExitStep = vi.fn(() => false)
    const ui = render(
      wizard(current, { canProceed: false, onExitStep }),
    )
    await current.value!.goTo(1)
    await settle()
    expect(ui.lastFrame()).toContain("First page")
    expect(onExitStep).toHaveBeenCalledOnce()

    ui.rerender(wizard(current, { canProceed: false }))
    await settle()
    await current.value!.goTo(1)
    await settle()
    expect(ui.lastFrame()).toContain("Second page")
  })

  it("supports a controlled step and reports requested navigation", async () => {
    const current: { value?: StepContext } = {}
    const onStepChange = vi.fn()
    const ui = render(wizard(current, { step: 0, onStepChange }))
    await current.value!.goNext()
    await settle()
    expect(onStepChange).toHaveBeenCalledWith(1)
    expect(ui.lastFrame()).toContain("First page")

    ui.rerender(wizard(current, { step: 1, onStepChange }))
    await settle()
    expect(ui.lastFrame()).toContain("Second page")
  })

  it("goes back and cancels when already on the first step", async () => {
    const current: { value?: StepContext } = {}
    const onCancel = vi.fn()
    const { lastFrame } = render(wizard(current, { onCancel }))
    await current.value!.goNext()
    await settle()
    await current.value!.goBack()
    await settle()
    expect(lastFrame()).toContain("First page")
    await current.value!.goBack()
    await settle()
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it("does not capture Enter by default, but opts in when requested", async () => {
    const current: { value?: StepContext } = {}
    const ui = render(wizard(current))
    ui.stdin.write("\r")
    await settle()
    expect(ui.lastFrame()).toContain("First page")
    ui.unmount()

    const enabled: { value?: StepContext } = {}
    const focused = render(wizard(enabled, { keyboardNav: true }))
    focused.stdin.write("\r")
    await settle()
    expect(focused.lastFrame()).toContain("Second page")
  })

  it("keeps a keyed step active when children reorder", async () => {
    const current: { value?: StepContext } = {}
    const view = (reversed: boolean) => {
      const elements = [
        <Step key="a" name="A">{(ctx) => { current.value = ctx; return <Text>A page</Text> }}</Step>,
        <Step key="b" name="B">{(ctx) => { current.value = ctx; return <Text>B page</Text> }}</Step>,
      ]
      return <Stepper onComplete={() => {}}>{reversed ? elements.reverse() : elements}</Stepper>
    }
    const ui = render(view(false))
    await current.value!.goNext()
    await settle()
    expect(ui.lastFrame()).toContain("B page")
    ui.rerender(view(true))
    await settle()
    expect(ui.lastFrame()).toContain("B page")
    expect(current.value?.currentStep).toBe(0)
  })

  it("supports vertical and fully completed progress with ASCII tokens", () => {
    const { lastFrame } = render(
      <ThemeProvider theme="mono" ascii>
        <StepperProgress
          orientation="vertical"
          currentStep={2}
          steps={[
            { id: "a", name: "One" },
            { id: "b", name: "Two" },
          ]}
        />
      </ThemeProvider>,
    )
    expect(lastFrame()).toContain("+ 1. One")
    expect(lastFrame()).toContain("+ 2. Two")
  })
})
