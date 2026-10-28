import React from "react"
import { render } from "ink-testing-library"
import { describe, expect, it } from "vitest"
import { motion } from "../tokens.js"
import { Spinner } from "./spinner.js"

describe("Spinner", () => {
  it("uses the shared Unicode motion tokens by default", () => {
    const output = render(<Spinner label="Working" />)
    expect(output.lastFrame()).toContain(motion.spinner[0])
    expect(output.lastFrame()).toContain("Working")
    output.unmount()
  })

  it("supports the shared ASCII motion tokens", () => {
    const output = render(<Spinner ascii label="Loading" />)
    expect(output.lastFrame()).toContain(motion.asciiSpinner[0])
    expect(output.lastFrame()).toContain("Loading")
    output.unmount()
  })
})
