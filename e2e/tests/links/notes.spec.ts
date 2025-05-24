import { test, expect } from "@playwright/test";
import { setupDashboard } from "../global/setup.dashboard";

test.describe("Link Notes Functionality", () => {
  // Use the dashboard setup for all tests in this suite
  test.beforeEach(async ({ page }) => {
    await setupDashboard(page);
  });

  test("should allow adding a note during link creation and display it", async ({ page }) => {
    // Open the "New Link" modal
    await page.getByRole("button", { name: "Create new link" }).click();
    
    // Wait for modal to be visible (basic check)
    await expect(page.getByRole("dialog", { name: "Create new link" })).toBeVisible();

    // Fill in URL
    const linkURL = `https://example.com/test-link-${Date.now()}`;
    await page.getByPlaceholder("Link URL").fill(linkURL);

    // Select a collection (assuming 'Unorganized' is a default or selectable option)
    // This might need adjustment based on how collections are handled.
    // For now, let's assume clicking it and picking the first one or a known one.
    await page.getByText("Collection").click(); // This is a label, the input is next/below
    // Click the input associated with collection, then select an option.
    // This selector needs to be specific to the collection selection component.
    // Assuming a common pattern for custom selects, e.g., a div that opens a list.
    // Let's say the default is "Unorganized" and it's acceptable.
    // If not, we'd do: await page.locator('input[id^="react-select-"]').fill("Unorganized"); await page.getByText("Unorganized", { exact: true }).click();

    // Expand "more options"
    await page.getByRole("button", { name: "More options" }).click();

    // Enter text into the new "notes" textarea
    const noteText = "This is a test note added during creation.";
    await page.getByPlaceholder("Link notes placeholder").fill(noteText);

    // Submit the form
    await page.getByRole("button", { name: "Create link" }).click();

    // Wait for success toast or modal to close
    await expect(page.getByText("Link created")).toBeVisible();
    // Or await expect(page.getByRole("dialog", { name: "Create new link" })).not.toBeVisible();


    // Open the created link's details modal
    // This requires finding the link in the dashboard and clicking its details button/icon
    // This part is highly dependent on dashboard structure.
    // Assuming the link appears in a list or grid and we can identify it by its URL or name.
    // Let's assume a card/row for the link contains its URL and a button to view details.
    // This will likely be: await page.getByText(linkURL).first()... then navigate to its details.
    // For simplicity in this step, let's assume clicking the link name opens details, or a specific details button.
    // This part needs to be robust.
    // Let's say there's a "Links" navigation item, then a list of links.
    // await page.getByRole('link', { name: 'Links' }).click(); // If needed
    
    // Click on the link to open its details (assuming this interaction)
    // This is a placeholder selector
    await page.locator(`.link-card:has-text("${linkURL}")`).getByRole('button', { name: 'View details' }).click(); // Adjust selector
    
    // Wait for link details modal to be visible
    await expect(page.getByRole("dialog")).toBeVisible(); // General dialog check
    
    // Verify that the notes entered during creation are displayed correctly in "view" mode.
    await expect(page.locator("div:has-text('Notes') + div > p")).toHaveText(noteText);
    // A more robust selector might be needed, e.g., based on a data-testid for the notes display area.
    // Or: await expect(page.getByText(noteText)).toBeVisible(); (if text is unique enough)
  });

  // Test Case 2: Edit a note for an existing link.
  test("should allow editing a note for an existing link", async ({ page }) => {
    // Setup: Create a link first (or ensure one exists)
    const linkURL = `https://example.com/editable-link-${Date.now()}`;
    const initialNote = "Initial note for editing.";

    await page.getByRole("button", { name: "Create new link" }).click();
    await page.getByPlaceholder("Link URL").fill(linkURL);
    await page.getByRole("button", { name: "More options" }).click();
    await page.getByPlaceholder("Link notes placeholder").fill(initialNote);
    await page.getByRole("button", { name: "Create link" }).click();
    await expect(page.getByText("Link created")).toBeVisible();

    // Open the link's details modal
    // Placeholder selector - adjust based on actual UI
    await page.locator(`.link-card:has-text("${linkURL}")`).getByRole('button', { name: 'View details' }).click(); 
    await expect(page.getByRole("dialog")).toBeVisible();

    // Switch to "edit" mode
    // Assuming an "Edit" button or icon is available in the details modal
    await page.getByRole("button", { name: "Edit" }).click(); // Placeholder, might be an icon button

    // Modify the text in the "notes" textarea
    const updatedNoteText = "This note has been updated.";
    // The placeholder in edit mode for LinkDetails might be different or not exist if field has content
    // Assuming the textarea is identifiable, perhaps by being the one after a "Notes" label in edit mode
    await page.locator("label:has-text('Notes') + textarea").fill(updatedNoteText);
    // Or use the placeholder if it's still relevant:
    // await page.getByPlaceholder("Link notes placeholder").fill(updatedNoteText);


    // Save the changes
    await page.getByRole("button", { name: "Save changes" }).click();
    
    // Wait for success toast or modal to update/close and re-open
    await expect(page.getByText("Updated")).toBeVisible();
    // If modal closes, re-open it:
    // await page.locator(`.link-card:has-text("${linkURL}")`).getByRole('button', { name: 'View details' }).click(); 
    // await expect(page.getByRole("dialog")).toBeVisible();

    // Verify that the updated notes are displayed correctly in "view" mode.
    // Ensure we are in view mode (it might switch automatically after save)
    await expect(page.locator("label:has-text('Notes') + textarea")).not.toBeVisible(); // Check edit mode field is gone
    await expect(page.locator("div:has-text('Notes') + div > p")).toHaveText(updatedNoteText);
  });

  // Test Case 3: Verify notes are optional and can be added later.
  test("should allow creating a link without notes and adding them later", async ({ page }) => {
    // Create a new link without filling in the notes field
    const linkURL = `https://example.com/optional-notes-${Date.now()}`;
    await page.getByRole("button", { name: "Create new link" }).click();
    await page.getByPlaceholder("Link URL").fill(linkURL);
    // No notes added intentionally
    await page.getByRole("button", { name: "Create link" }).click();
    await expect(page.getByText("Link created")).toBeVisible();

    // Open the created link's details modal
    // Placeholder selector
    await page.locator(`.link-card:has-text("${linkURL}")`).getByRole('button', { name: 'View details' }).click(); 
    await expect(page.getByRole("dialog")).toBeVisible();

    // Verify that the notes section shows a "no notes provided" message.
    // This depends on the exact text used in LinkDetails.tsx for empty notes.
    await expect(page.getByText("No notes provided")).toBeVisible(); 
    // Or, if it's just an empty paragraph or the notes section is absent:
    // await expect(page.locator("div:has-text('Notes') + div > p")).toBeEmpty();

    // Switch to "edit" mode
    await page.getByRole("button", { name: "Edit" }).click();

    // Add some notes
    const addedNoteText = "Notes added after link creation.";
    await page.locator("label:has-text('Notes') + textarea").fill(addedNoteText);

    // Save and verify the notes are displayed
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Updated")).toBeVisible();
    
    // Verify notes in view mode
    await expect(page.locator("label:has-text('Notes') + textarea")).not.toBeVisible();
    await expect(page.locator("div:has-text('Notes') + div > p")).toHaveText(addedNoteText);
  });
});
