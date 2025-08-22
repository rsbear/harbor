// src/app/App.test.js
import { flushSync } from "svelte";
import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";

// Import the actual App component
import App from "./App.svelte";

test("renders the command input field", () => {
  // 1. Render the App component
  render(App);

  // 2. Find the input field by its placeholder text
  const input = screen.getByPlaceholderText("Enter a command...");

  // 3. Assert that the input element is in the document
  expect(input).toBeInTheDocument();
});
