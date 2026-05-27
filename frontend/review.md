# Code Review: Mutual NDA Generator (Next.js 14 Frontend)

**Reviewed by:** Claude Code (code-reviewer agent)
**Date:** 2026-05-25
**Scope:** All files under `src/`, `__tests__/`, and config files

---

## Executive Summary

The project is well-structured and the >90% test coverage claim is credible. The code is readable, TypeScript strict mode is on, and the App Router conventions are mostly followed. However, there are several concrete issues that must be addressed before a production deployment: one functional XSS vector, one silent data-loss bug in the number inputs, a duplicated constant that creates a maintenance trap, a test mock that makes the markdown rendering tests almost entirely worthless, and several accessibility gaps that affect screen-reader users on the primary user-facing form.

---

## CRITICAL Issues

### Issue 1: XSS via `rehype-raw` rendering unsanitized user input

- **Files:** `src/components/StandardTerms.tsx` (line 24), `src/lib/assembleDocument.ts` (lines 115–119)
- **Severity:** High
- **Confidence:** 95%

`assembleStandardTerms` builds the preview markdown by string-interpolating raw user values (`purpose`, `governingLaw`, `jurisdiction`, `modifications`) directly into a `<mark>` tag wrapper:

```ts
const replacement = forPreview ? `<mark class="nda-chip">${value}</mark>` : value;
```

Those values come from `sessionStorage` in `PreviewPage` (parsed and cast with no validation). `sessionStorage` data can be tampered with by browser extensions, injected scripts, or XSS payloads from another page on the same origin.

`StandardTerms.tsx` renders the result with `rehypeRaw` enabled, which passes HTML directly to the DOM rather than escaping it. A stored value like `<script>alert(1)</script>` in `purpose` would be rendered as live HTML.

**Fix:** Either (a) HTML-encode the user-supplied `value` before injecting it into the `<mark>` wrapper (escaping `<`, `>`, `"`, `&`), or (b) restructure `assembleStandardTerms` to emit a data structure and use React components to render chips — removing the need for `rehype-raw` entirely. Option (b) is safer.

---

## IMPORTANT Issues

### Issue 2: `Number(e.target.value)` silently converts empty input to `0`

- **File:** `src/app/nda/new/page.tsx` (lines 190 and 228)
- **Severity:** High
- **Confidence:** 92%

Both the MNDA Term and Confidentiality Term year inputs use `Number(e.target.value)`. When a user clears the field, `Number("")` returns `0`, setting state to `{ type: 'fixed', years: 0 }`. The generated document then reads "0 year(s) from Effective Date" — a legally meaningless value. Step 2 has no validation to catch this.

HTML `min={1}` does not prevent `onChange` from firing with a cleared or manually typed `0`.

**Fix:** Use `parseInt` with a guard:
```ts
const parsed = parseInt(e.target.value, 10);
if (!isNaN(parsed) && parsed > 0) update(...);
```
Or add step-2 validation in `validateStep` that checks `years >= 1`.

---

### Issue 3: `SESSION_KEY` duplicated across two files

- **Files:** `src/app/nda/new/page.tsx` (line 10), `src/app/nda/preview/page.tsx` (line 16)
- **Severity:** Medium
- **Confidence:** 90%

Both pages independently define `export const SESSION_KEY = 'ndaFormValues'`. The test file `PreviewPage.test.tsx` (line 19) also hard-codes the string rather than importing it. If the key is changed in one place, the other locations silently break — the preview page will always show the "No form data found" error state.

**Fix:** Extract `SESSION_KEY` to `src/lib/constants.ts` and import it in both page files and the test.

---

### Issue 4: Confidentiality term year input has no `max` constraint

- **File:** `src/app/nda/new/page.tsx` (lines 219–232)
- **Severity:** Medium
- **Confidence:** 87%

The MNDA Term input has `max={10}` but the confidentiality term year input does not. A user can type `9999` years, which flows into the document text as-is.

**Fix:** Add `max={99}` (or a reasonable domain limit) to the confidentiality term year `<input>`.

---

### Issue 5: `sessionStorage` data cast without runtime validation

- **File:** `src/app/nda/preview/page.tsx` (line 27)
- **Severity:** Medium
- **Confidence:** 85%

```ts
setFormValues(JSON.parse(raw) as NdaFormValues);
```

The `as NdaFormValues` cast provides no runtime guarantee. If `sessionStorage` contains a structurally valid JSON object missing fields (stale session, browser extension interference), downstream calls to `assembleCoverPage` and `assembleStandardTerms` will receive `undefined` for fields like `values.party1.company`, producing malformed output or an unhandled runtime crash. The existing `try/catch` only catches `JSON.parse` syntax errors, not structural mismatch.

**Fix:** Add a minimal shape-check before accepting the parsed object — at minimum verify that `parsed.party1` and `parsed.party2` are objects. For a more robust solution, use `zod` for parsing and validation.

---

### Issue 6: Accessibility — form error messages not programmatically associated with inputs

- **Files:** `src/components/FormField.tsx` (lines 22–24), `src/app/nda/new/page.tsx` (lines 151, 161, etc.)
- **Severity:** Medium
- **Confidence:** 88%

`FormField` renders error messages as `<p role="alert">` but no `aria-describedby` links the input to its error paragraph. Inputs have `aria-invalid={!!error}` (correct), but without `aria-describedby`, screen readers announce the field as invalid without announcing what the error message says. This is a WCAG 2.1 Level A violation (1.3.1 Info and Relationships).

**Fix:** Generate an error id from `htmlFor` and wire it up:
```tsx
const errorId = error ? `${htmlFor}-error` : undefined;
// On the error <p>: id={errorId}
// On the input: aria-describedby={errorId}
```

---

## Test Quality Issues

### Issue 7: `ReactMarkdown` mock makes component tests nearly worthless — including the XSS path

- **Files:** `__mocks__/react-markdown.tsx`, `__tests__/components/CoverpageSection.test.tsx`, `__tests__/components/StandardTerms.test.tsx`
- **Severity:** Medium
- **Confidence:** 90%

The `ReactMarkdown` mock renders `{children}` as plain text inside a `<div>`. This means:

1. `CoverpageSection.test.tsx` asserts `screen.getByText('# Mutual NDA Cover Page')` — it is checking that the mock echoes back the raw markdown string, not that a heading is rendered. The test would pass even if the component was completely broken as a markdown renderer.
2. `StandardTerms.test.tsx` asserts the raw chip-annotated markdown string is present as text. In the real component, `rehype-raw` would parse `<mark>` as HTML — it would not appear as a raw string. The test verifies the wrong thing.
3. The XSS scenario from Issue 1 is completely untestable with this mock.

**Fix:** The mocks are acceptable for crash-detection tests. However, add at least one integration-level test that verifies the HTML injection path for `StandardTerms` using the real `react-markdown`. For `CoverpageSection`, either document the mock limitation or assert rendered HTML structure.

---

### Issue 8: `buildDownloadFilename` test encodes a double-hyphen bug

- **File:** `__tests__/lib/downloadMarkdown.test.ts` (line 13)
- **Severity:** Low
- **Confidence:** 85%

```ts
expect(buildDownloadFilename('Foo & Bar!', 'Baz (Co.)')).toBe('mutual-nda-foo--bar-baz-co.md');
```

The expected value `foo--bar` contains a double-hyphen — a result of `&` being stripped (leaving a space) then both the original space and the new space being converted to hyphens independently. The test encodes what the code does rather than what is correct.

**Fix:** Fix `normalize` to strip non-alphanumeric characters before collapsing spaces:
```ts
const normalize = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
```
Then update the test expectation to `'mutual-nda-foo-bar-baz-co.md'`.

---

### Issue 9: Test file naming inconsistency

- **File:** `__tests__/pages/WizardPage.test.tsx`
- **Severity:** Low
- **Confidence:** 82%

The wizard page source lives at `src/app/nda/new/page.tsx`. The test file is named `WizardPage.test.tsx` — mismatched with the file path convention used elsewhere. Not a functional problem, but will cause confusion as the project grows.

---

## Configuration / Convention Notes

### Issue 10: `LandingPage` uses `useRouter` where `<Link>` would suffice

- **File:** `src/app/page.tsx` (line 1)
- **Severity:** Low
- **Confidence:** 82%

`LandingPage` uses `useRouter` only for programmatic navigation on a button click, which requires the `'use client'` directive. The preferred App Router pattern is to use `<Link href="/nda/new">` for simple navigation, which would make the component server-renderable (no client JS needed for the initial render) — a performance improvement that also follows App Router conventions.

---

## Final Verdict: Not Production-Ready

The application is well-organized, has meaningful test coverage, and follows Next.js App Router structure cleanly. Two issues block production deployment:

1. **Issue 1 (XSS)** — User-controlled values are injected as raw HTML and rendered by `rehype-raw`. This is a real vulnerability on the preview page.
2. **Issue 2 (silent 0-year documents)** — Clearing a year input silently generates an invalid legal document with no user-facing error.

These two must be resolved. Issues 3 (duplicated constant), 5 (unvalidated sessionStorage cast), and 6 (accessibility) are important quality items that should be addressed in the same pass before any user-facing launch. The remaining issues are lower priority but worth tracking.

---

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | XSS via `rehype-raw` + unsanitized user input | High | Open |
| 2 | Silent `0`-year document on cleared input | High | Open |
| 3 | `SESSION_KEY` duplicated — no shared constant | Medium | Open |
| 4 | Confidentiality term missing `max` constraint | Medium | Open |
| 5 | `sessionStorage` cast without runtime validation | Medium | Open |
| 6 | Error messages not linked to inputs via `aria-describedby` | Medium | Open |
| 7 | `ReactMarkdown` mock hides real rendering behaviour in tests | Medium | Open |
| 8 | `buildDownloadFilename` test encodes a double-hyphen bug | Low | Open |
| 9 | Test file naming inconsistent with source file path | Low | Open |
| 10 | `LandingPage` uses `useRouter` where `<Link>` would suffice | Low | Open |
