# Contributing

Thanks for your interest in improving the Condense website.

This repository contains the static website for [condense.js.org](https://condense.js.org), including the documentation pages, blog content, and site styling. The main Condense product and its SDK/docs live in the upstream repository at [studioframes/Condense](https://github.com/studioframes/Condense).

## How to contribute

1. Fork the repository and create a branch for your change.
2. Make your edits locally.
3. Preview the site locally to confirm everything looks correct.
4. Open a pull request with a clear summary of the change.

## Local preview

This project is a static website, so you can preview it locally without a build step.

From the repository root, run:

```bash
npm run dev
```

Then open http://localhost:8000 in your browser.

## What to update

You may want to contribute by:

- improving site copy or layout
- adding or editing documentation content
- fixing styling issues
- updating blog posts or changelog entries
- improving accessibility or usability

## Guidelines

- Keep changes focused and easy to review.
- Preserve the existing tone and structure of the site.
- Use clear, concise language.
- If you are changing product behavior or API details, check the main Condense project documentation first.

## Reporting issues

If you notice a problem with the website, please open an issue describing:

- what you expected to see
- what actually happened
- steps to reproduce the issue
- any relevant screenshots or links

## Pull requests

When you open a pull request, please:

- keep the change focused and scoped
- include a clear summary of what changed
- note any testing you performed
- reference related issues when helpful

## CI checks

All pushes and pull requests run the repository's CI workflow. The workflow checks that the basic project files are present and that the test script completes successfully.
