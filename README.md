# Flip It Out

A website and an installable app that check papers for similarity, plagiarism and AI writing, and produce two PDF reports for every document scanned:

- **Similarity Report**: Cover Page, Integrity Overview (Overall Similarity, filters, the four match groups, internet / publications / submitted works shares, integrity flags), the numbered Top Sources list, then every page of the paper with matches highlighted in each source's colour and source numbers in the margin.
- **AI Writing Report**: Cover Page, AI Writing Overview (percentage detected as AI, number of AI-generated segments, caution and disclaimer), then every page of the paper with the likely AI-generated text highlighted.

Both reports use the same page grid, typefaces, colours and wording as the reference reports in every scan.

## How it works

1. **Reading.** PDFs are read with pdf.js, keeping every word's position so highlights land on the original page. Word (.docx), text, Markdown, RTF and pasted text are laid out on Letter pages in Tinos.
2. **Text model.** Words, sentences and paragraphs; quotation marks; in-text citations (author-year and numbered); the bibliography; integrity flags for replaced characters (look-alike letters from other alphabets) and hidden text (invisible characters inside words, tiny text).
3. **Searching.** Eight-word phrases and keyword queries from the paper are searched in Wikipedia (full articles), OpenAlex, Crossref, Europe PMC and Semantic Scholar, plus Google Programmable Search when a key is given. Every earlier submission in the browser's repository and every other file in the same batch is searched too.
4. **Similarity.** Five-word fingerprints. Overall Similarity is the share of the paper's words matched to any source; Top Sources gives each matched word to the strongest source first, so overlapping sources are not counted twice. Matches are grouped as Not Cited or Quoted, Missing Quotations, Missing Citation, and Cited and Quoted. The bibliography, quoted text and small matches can be filtered out.
5. **AI writing.** Only qualifying prose is scored (no headings, lists, tables, bibliography or fragments). Each sentence is scored in overlapping windows of its neighbours by a logistic model over stylometric signals (vocabulary predictability, word length, sentence-length burstiness, stock transitions and phrases, citation, number and punctuation habits). The model was fitted on sentence-level labels from the reference AI Writing Report and reproduces its 27% on that manuscript. At least 300 qualifying words are needed; scores from 1% to 19% show as *% without highlights.

Everything runs in the browser. Only search phrases leave the device.

## Files

- `index.html`: the website, with the scanner, how it works, the reports, install steps and FAQ
- `app/index.html`: the installable app (scanner, submissions, settings)
- `assets/js/`: `text.js` (text model), `extract.js` (PDF, Word and text reading), `sources.js` (databases and the repository), `similarity.js` (matching), `ai.js` (AI writing detection), `report.js` (the two report PDFs), `ui.js` and `boot.js` (interface)
- `assets/vendor/`: pdf.js 3.11.174, pdf-lib 1.17.1, @pdf-lib/fontkit 1.1.1, mammoth 1.8.0
- `assets/fonts/`: Lexend Deca and Noto Sans (report headings and text), Tinos (Word and text pages); SIL Open Font License
- `manifest.webmanifest`, `sw.js`: installing and offline use
- `tests/`: Node checks for the engines

## Publish

The site is published by GitHub Pages from the `gh-pages` branch, which carries the same files as `main`. After changing `main`, publish with `git push origin main:gh-pages`.

- Website: https://pogi6969.github.io/FLIP-IT-OUT/
- App: https://pogi6969.github.io/FLIP-IT-OUT/app/

Run locally with `python3 -m http.server 8000` and open http://localhost:8000.

After changing any file, bump `VERSION` in `sw.js` so installed copies refresh.

## Tests

```
cd tests
npm install
npm test
```

## Selling Pro

The free copy on GitHub Pages has every feature. The paid site runs the same files with plans turned on:

- **Free:** a few scans a day (3 by default), one file at a time, scores and top sources on screen.
- **Pro:** unlimited scans, whole-class batches, and the full reports to view and download.

GitHub Pages does not allow sites built mainly for selling, so the paid site goes on Cloudflare Pages (free plan, selling allowed).

1. **Lemon Squeezy** (handles checkout, tax and payouts): create a store and a product with **license keys** turned on. Note the store ID, the product ID and the product's checkout link.
2. **Cloudflare Pages:** Create project → Connect to Git → this repository, branch `main`.
   - Build command: `node tools/configure.mjs`
   - Build output directory: `/`
   - Environment variables:
     - `PAID` = `1`
     - `CHECKOUT_URL` = the Lemon Squeezy checkout link
     - `PRICE_LABEL` = for example `₱149 a month`
     - `FREE_SCANS` = free scans per day (default 3)
     - `OWNER_KEY` = a long secret only you know: enter it under Settings → Plan to unlock Pro for good
     - `LS_STORE_ID`, `LS_PRODUCT_ID` = your Lemon Squeezy store and product IDs
3. Deploy. `functions/api/verify.js` becomes `/api/verify`, which checks license keys with Lemon Squeezy and accepts your owner key. Keys are checked again every week, so refunded or expired keys stop working.

Reading and scanning happen in the browser, so a determined person could edit the page to skip the limits. The plan keeps honest users on the right tier; it is not copy protection.
