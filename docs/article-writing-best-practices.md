# Article Writing Best Practices

A complete reference for everyone writing, generating, or reviewing long-form articles in this publishing pipeline. Rules derive from the system prompts, post-processing functions, QA gate, component contracts, and the page renderer in `src/app/[locale]/arthra/[slug]/page.tsx`. Where a rule conflicts with a writing instinct, the rule wins.

---

## 1. Article Structure and Layout Order

The page component renders a fixed sequence of elements. The markdown body drives only the section from the summary paragraph through to the FAQ heading. Everything else — breadcrumb, H1, author micro-credit, hero image, AuthorBio card, prev/next navigation — is rendered by the page from metadata. The markdown writer controls what appears inside the body, not the full page.

### 1.1 Title (H1)

The page component renders an H1 from `title_el` / `title_en` in the BlogArticle metadata. The markdown body must never contain a `# Heading` (single `#`). A H1 in the markdown body creates a duplicate visible heading and fails the QA gate as a hard failure. The title should answer the article's primary question or state it directly. Target 50-60 characters for search result display. Avoid keyword stuffing; use the primary keyword once, naturally.

### 1.2 Author Micro-Credit (Top)

Immediately below the H1, the page renders a row containing: a 22×22 px circular author photo, the publish date in locale format, and the author's name as an anchor link pointing to `#author-bio`. This links the top of the article to the full author card at the bottom so readers can verify the author's credentials at any point. This is rendered entirely from metadata (`authorSlug`, `publishedDate`, `author`); the markdown body does not control it.

### 1.3 Summary Box ("At a Glance")

The first paragraph of the markdown body is extracted by the page and rendered inside a branded summary box — a rounded container with a 2% brand-red background, a brand-red border at 25% opacity, and a floating pill label ("At a glance" / "Με μια ματιά"). This paragraph must directly answer the article's primary question in 2-4 sentences. The answer appears in the opening sentence, not after a build-up. If the ArticleSpec defines a verbatim `answer` field for the locale, that text is injected into the generation prompt and must appear word-for-word in the output.

This paragraph is not preceded by any heading in the markdown. The page detects it as the first non-heading, non-ToC block and pulls it out automatically. Do not write `## Summary` or any label above it.

### 1.4 Table of Contents (Numbered, Scroll Links)

The block immediately after the summary paragraph must be the ToC. The ToC is a bullet list where every item is a markdown link: `- [Section title](#anchor-slug)`. The page renders it as a numbered list (01., 02., …) inside a rounded box with `border-border bg-surface`. Each number is typeset in brand red (`text-brand`). The anchor in each link must match the `id` the prose renderer assigns to the corresponding H2 — which is the heading text converted to lowercase with spaces replaced by hyphens and non-alphanumeric characters stripped.

The ToC has no heading above it. No `## Contents`, no `**In this article**`. The reason: adding a label above the ToC inserts a false entry into the page outline and breaks the numbered visual rhythm the page component renders.

### 1.5 Hero Image

After the ToC, the page renders the hero image from `heroImagePath`. The image is displayed 16:9, full-width, `object-cover`, with a figcaption below from `heroCaption_el` / `heroCaption_en`. The alt text comes from `heroImageAlt_el` / `heroImageAlt_en`. Hero image metadata is defined in `src/lib/blog.ts`, not in the markdown body. The hero renders before any of the body prose.

Hero alt text must describe the image content genuinely — what is in the frame, not the article topic. A single-word alt text or a keyword phrase is prohibited. The caption should credit the photographer: "Photo: Photographer Name." The reason attribution must be explicit: stock photo providers require it as a condition of use.

### 1.6 H2 Body Sections

The body consists of H2 sections introduced by `## Heading text` in sentence case. The primary locale requires 6-8 H2 sections; the secondary locale requires exactly 8. No H3 headings appear anywhere. The prose renderer does not handle H3 and would render `###` as literal characters. The QA gate catches H3 as a hard failure.

Per-section word targets: 200-300 words in the primary locale, 250-350 words in the secondary locale. These are floors and ceilings per section, not article averages. A section under the floor is under-written; a section over the ceiling should be split.

### 1.7 Body Images (Inline)

For a 2,000-word article, two body images appear in the article body in addition to the hero. One image per 1,000 words of body content is the target ratio. Images are placed at editorially relevant points — not stacked at the end, not in consecutive sections.

Two delivery mechanisms:

**Inline via markdown (preferred for new articles):** The generation prompt receives image search results via `inline_image_queries`. The model places images using `![alt text](src)` followed immediately by an italic caption `*Caption text. Photo: Photographer Name.*` on the next line or block.

**Injected via page component (legacy fallback):** If `/public/blog/{article-id}/image2.jpg` exists and the article has no inline images, the page injects it after H2 number 4 via the `injectImages` prop. Alt text and caption come from `imageCredits.image2` in BlogArticle; if absent, a generic fallback is used.

Both methods render into a 16:9 `object-cover` container. Images with extreme portrait ratios lose most of their content when forced into 16:9; choose landscape or square subjects.

### 1.8 Embedded Media Tokens

Infographic, widget, and video tokens appear inline within H2 sections as standalone blocks, separated from surrounding prose by blank lines. Placement rule: the token appears after at least one prose paragraph in the H2 section that most directly relates to the media content. Never place a token as the opening element of a section. Never stack two media tokens inside the same section. Never place a media token just above the FAQ as a catch-all position.

Tokens:
- `{{infographic:type}}` — server-rendered SVG component
- `{{widget:id}}` — interactive client component
- `{{video:youtube_id}}` — YouTube nocookie iframe, responsive aspect-video container

### 1.9 Closing Paragraph

After the last H2 body section, before the FAQ heading, a closing paragraph of approximately 80 words provides a forward-looking or action-oriented takeaway. Must not open with "in conclusion", "to summarize", "as we have seen", or any equivalent. The reason: those phrases mark the end of an essay; article readers may act on what they have read.

### 1.10 FAQ Section

The FAQ heading is `## FAQ` in the primary locale. It signals the page to split the markdown and render the FAQ section separately — inside a rounded card with `divide-y` separators, below the AuthorBio card. Contains exactly 5 question-answer pairs. Each question is a standalone bold line: `**Question text?**`. A blank line follows. The answer is plain prose, not bold, not in a list. FAQ answers must add content not found in the body: each answer introduces one additional fact, exception, or next step.

### 1.11 AuthorBio Card (Bottom)

The page renders an `<AuthorBio>` component wrapped in `<div id="author-bio">` below the body prose and above the FAQ card. The component displays: a 56×56 px circular author photo (linked to the author's profile page), the author's name (linked to profile page) with a LinkedIn icon in `#0A66C2`, the author's title in `text-text-muted`, and the `bio_short` paragraph in `text-text-secondary`. The section heading ("About the Author" / "Σχετικά με τον Συγγραφέα") appears in 11px uppercase tracking-widest above the card. The author micro-credit at the top of the page links to this `#author-bio` anchor.

---

## 2. EEAT Signals

EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) signals are embedded at three layers: the page's structured data, the author display, and the content itself.

### 2.1 Author Schema (Structured Data)

The page emits an Article JSON-LD schema for every article. The `author` field contains:
```json
{
  "@type": "Person",
  "name": "Author Full Name",
  "url": "https://domain.com/arthrografoi/slug",
  "sameAs": ["https://www.linkedin.com/in/author-linkedin/"]
}
```
The `sameAs` array links the author entity to their LinkedIn profile, establishing a verifiable identity signal for crawlers. When no Author record exists for a slug, the schema falls back to `{"@type": "Organization", "name": article.author}`. Always use a real Author record; the organization fallback provides no person-level EEAT signal.

### 2.2 Author Data Structure

Each author in `src/lib/authors.ts` defines:
- `slug` — URL segment for the author profile page
- `name` — full display name
- `title_en` / `title_el` — professional title, shown below the name in the AuthorBio card
- `linkedIn` — full LinkedIn profile URL, rendered as an icon link
- `photo` — path to a real photograph (not avatar, not illustration)
- `bio_short_en` / `bio_short_el` — 2-4 sentence summary used in the AuthorBio card; must mention relevant credentials and measurable achievements
- `bio_en` / `bio_el` — full biography for the author profile page; should include career history, domain expertise, and personal motivation

The short bio is the primary EEAT surface on article pages. It must establish: (a) what domain expertise the author has, (b) evidence of that expertise (numbers, roles, years), and (c) why they are credible on this specific topic. A short bio that says only "Jane writes about driving" establishes no EEAT signal.

### 2.3 EEAT Signals in Content

Beyond the author card, the article body itself carries EEAT signals:

**Experience signals:** The author has personally encountered the problem the article addresses. First-person framing in the intro or a specific anecdote ("When I went through this process…") outperforms generic third-person exposition. This should appear in the intro or closing paragraph, not throughout the body.

**Expertise signals:** Claims must be grounded in specifics. Dates, official body names, document names, case conditions. A paragraph that says "it takes a few weeks" is weaker than one that says "the standard processing time is 6-8 working days at the Department of Road Transport." When the exact figure cannot be confirmed, direct the reader to the official source rather than hedging.

**Authoritativeness signals:** At least one link per article must point to an external high-DA domain — an official government website, a well-known institution, or a recognized industry body. This link must appear in prose, not in a list. It should cite the source for a specific claim, not just mention the organization in passing. The reason: a page that never cites external authoritative sources appears to operate in isolation; one external citation per article is the minimum credibility threshold.

**Trustworthiness signals:** The article must not make claims it cannot support, must not omit known drawbacks, and must acknowledge when a situation varies by individual case. If a process costs different amounts depending on circumstances, say so. If a rule has exceptions, state them. An article that presents only the best-case scenario is not trustworthy.

### 2.4 Author Photo Requirements

The author photo must be: a real photograph of the person, at least 200×200 px source size, a clear face shot, no watermarks, no stock photography. The photo is displayed at 56×56 px in the AuthorBio card and 22×22 px in the article header micro-credit. The `unoptimized` prop is required on the Next.js Image component for external URLs to prevent the optimization pipeline from dropping them.

---

## 3. Content Quality and Writing Standards

### 3.1 The Standard: Sweat and Investment

Every paragraph should read as though the writer looked up the specific rule, verified the current procedure, and spent time working out what actually matters to the reader. Generic "here is how process X works" prose fails this standard. Concrete, specific, verified prose passes it. The question to ask for every paragraph: "Would a reader who has just been through this process find anything here that surprised them, clarified something, or saved them time?" If the answer is no, the paragraph is filler and should be rewritten or removed.

### 3.2 Flesch-Kincaid Readability

Target Flesch-Kincaid Grade Level 8-10 (high school level). This corresponds to a Flesch Reading Ease score of approximately 60-70. Operationally:

- **Sentence length:** No sentence exceeds 20 words. This is a hard limit. At 20 words, split at the most natural clause boundary. The reason: sentence length is the dominant factor in FK grade level; cutting average sentence length from 22 to 16 words drops the grade level by approximately 1.5 points.
- **Syllable count:** Prefer words of 1-2 syllables. Avoid words of 4+ syllables unless there is no plain-English alternative. When a technical term requires 4+ syllables (e.g., "administrative"), use it once, define it, and avoid repeating it in the same paragraph. The FK formula penalizes polysyllabic words directly; each extra syllable-per-word raises grade level.
- **Word choice:** Choose the shorter, more common word when both are accurate. "Use" not "utilize". "Start" not "commence". "Get" not "obtain". "Check" not "verify" (in informal contexts). "Show" not "demonstrate".
- **Active voice:** Subject-verb-object order in the majority of sentences. Passive voice is permitted once per section for variety or when the actor is genuinely unknown; it must not be the default.

### 3.3 Non-AI Prose Patterns

AI-generated text has recognizable structural signatures. These must not appear in finished articles:

**Banned structural patterns:**
- Sentences that begin with "It is important to note that…" or equivalent preamble
- Paragraphs that open with "In addition," or "Furthermore," or "Moreover,"
- Closing paragraphs that begin with "In conclusion," or "To summarize,"
- Sentences structured as "Not only X, but also Y"
- Overuse of the em dash — particularly to insert parenthetical asides that could be separate sentences
- Lists of three adjectives separated by commas ("efficient, reliable, and seamless")
- Rhetorical questions used as section openers ("Wondering how long it takes?")
- The word "journey" to describe a process
- "Navigating" used metaphorically
- "Delve into" or "dive deep into"
- "Crucial" and "seamless" — both appear at disproportionately high rates in LLM output on procedural topics

**Rhythm variety:** Human writing varies paragraph length and sentence rhythm. Three consecutive sentences of similar length read as machine-generated. Alternate short declarative sentences with slightly longer compound ones. Break the expected pattern.

**Specificity over generality:** "Most schools charge between €X and €Y" is specific. "Costs vary" is not. "The form is available at the Department of Road Transport office or on their website" is specific. "You can get the form from the relevant authority" is not. Every paragraph should contain at least one specific detail.

**No hedge walls:** A paragraph full of "it may," "in some cases," "depending on your situation," "results may vary" signals the writer does not know the answer and is covering themselves. Use hedges only when the situation genuinely varies by case; state the condition explicitly ("if you moved to Cyprus before 2021," not "depending on when you moved").

### 3.4 Primary-Locale Banned Phrases (QA Gate)

The following phrases are prohibited in primary-locale articles. Case-insensitive substring match. Any match fails the QA gate as a hard failure.

- furthermore
- moreover
- it is worth noting
- in conclusion
- it goes without saying
- it is important to note
- navigating (when used metaphorically)
- delve
- crucial
- ensure
- seamless
- in today's fast-paced world
- rest assured

### 3.5 Em Dashes and En Dashes

Em dashes (`—`, U+2014) and en dashes (`–`, U+2013) are banned in all articles in all locales. Use a hyphen with spaces (` - `) or rewrite as two sentences. The post-processing function replaces `—` with ` - ` automatically, but write without them from the start. The QA gate checks for `—` and fails on any match.

### 3.6 Heading Style

H2 headings use sentence case: first word and proper nouns only. Title case is not used. No H3 headings.

---

## 4. Link Strategy

### 4.1 Internal Links (Minimum 5)

Every article must contain at least 5 internal links to other articles or site pages. Links go in prose, not in bullet lists. No two internal links may appear in the same paragraph. Anchor text must be a natural phrase from the surrounding sentence, not the raw page title pasted in. Links should be distributed across sections — one every 1-2 H2 sections. The reason for distributing them: clustering links in one place reads like a navigation block and reduces click-through on each individual link.

Link paths are site-root-relative. Links to unpublished pages create 404s; verify the target exists or will be published before or simultaneously with this article.

Internal links specified in the ArticleSpec (`internal_links_en` / `internal_links_el`) are mandatory starting points; they must all appear. If the spec provides fewer than 5 links, the writer must identify additional natural link opportunities during drafting.

### 4.2 External High-DA Link (Minimum 1)

Every article must contain at least one link to an external high domain-authority source: an official government website, a recognized institution, a well-known industry body, or a major reference publication. This link must appear in prose, citing the source for a specific verifiable claim. It must not be a bare mention ("according to the government website") without an actual hyperlink. The reason: a single cited external source signals to readers and crawlers that the article's claims can be checked; it is the minimum credibility threshold for procedural content.

High-DA external links carry `target="_blank" rel="noopener noreferrer"` when the URL is external (the prose renderer applies this automatically to URLs beginning with `https://`).

### 4.3 Natural Link Integration

Both internal and external links must fit the sentence grammatically. A link should not feel like it was bolted on after writing. Test: remove the link and replace it with plain text — if the sentence reads identically well, the anchor text is not natural. The anchor text should be the specific noun phrase that gives the reader a reason to click, not a generic phrase like "click here" or "this page".

---

## 5. Image Rules

### 5.1 Hero Image

Defined in blog.ts metadata. Fields: `heroImagePath`, `heroImageAlt_el`, `heroImageAlt_en`, `heroCaption_el`, `heroCaption_en`. Rendered by the page above the article body. The hero is always present; an article without a hero image path cannot be published.

Alt text requirements: genuine description of image content, specific enough that a blind reader understands what they are missing. Not the article title. Not a keyword phrase. Not a single word. Example of bad alt text: "Driving licence Cyprus". Example of good alt text: "A person handing over driving licence documents at a government service counter".

Caption format: `Photo: Photographer Name.` or a descriptive sentence followed by attribution. The reason attribution is in the caption: the hero image is the most prominently displayed image on the page and the one most likely to be indexed by image search.

### 5.2 Body Images

Two body images for a 2,000-word article. One additional image per additional 1,000 words. Images are distributed across the article, not clustered.

Inline image syntax: `![alt text](image-url)`. Caption on the immediately following line (same block or next block): `*Caption sentence. Photo: Photographer Name.*`. The prose renderer wraps both in a `<figure>` / `<figcaption>` pair. Alt text must describe image content genuinely, same standard as the hero.

For injected images (delivered via `injectImages` prop from the page): alt text and caption come from the `imageCredits` record in BlogArticle. Keys are the image filename without extension: `"image2"`, `"inline-1"`, `"inline-2"`. If a credit record is absent, the page uses a generic fallback — this is not acceptable for published articles; always populate `imageCredits`.

### 5.3 Aspect Ratio

All images render in a 16:9 container with `object-cover`. Extreme portrait-format images lose most of their content. Image search queries must favour landscape or square subjects. Avoid portrait-mode shots of people where the face would be cropped.

### 5.4 No Decorative Images

Every image must relate directly to the content of the surrounding section. Generic mood photography adds no informational value.

---

## 6. Infographic Components

### 6.1 Architecture

Server-rendered React component, no `"use client"`. Accepts `locale` prop. All user-visible strings live in a bilingual `DATA` object at the top of the file, keyed by locale. No hardcoded strings in JSX. The `<figure>` element is the outermost container; it carries consistent padding, `rounded-2xl`, and a `bg-[#f3f3f3]` background. A `<p>` caption is the last child.

### 6.2 SVG Coordinate System

Fixed viewBox width of 700 units. Height computed per component based on content. `className="w-full"` on the SVG element; no fixed pixel width or height. All element positions are expressed in viewBox units. The component scales responsively to its container.

### 6.3 Font

`fontFamily="system-ui, sans-serif"` on all SVG text elements. No web fonts. The reason: SVG text is rasterized at render time; if a web font is still loading, SVG text falls back to a browser default with different glyph metrics, causing overflow or clipping.

### 6.4 Text Wrapping

SVG has no native text wrap. Multi-word labels that exceed one line are split into arrays of strings in the data object. The component maps over the array and renders one `<text>` element per string, incrementing the `y` position by the line-height. No JS measurement, no `foreignObject`.

### 6.5 Brand Colours in SVG

Use the site's design tokens, expressed as hex values since SVG attributes do not accept CSS custom properties:

| Token | Hex | Use in SVG |
|---|---|---|
| `text-primary` | `#354354` | Primary labels, headings, step circles |
| `text-muted` | `#7a8794` | Sub-labels, captions, secondary text |
| `border` | `#e4e7eb` | Card borders, divider lines |
| `surface-muted` | `#f3f3f3` | Component background (use via Tailwind on `<figure>`) |
| `brand` | `#f74656` | Alert badges, highlight pills, active indicators |
| `brand-dark` | `#db1f35` | Denser brand accent |
| `brand-light` | `#fde7ea` | Soft brand fill |
| `star` | `#f59e0b` | Rating stars |
| Green (allowed) | `#22c55e` | Positive / allowed states |
| Red (denied) | `#ef4444` | Negative / denied states |

Do not introduce colours outside this palette without updating the table.

### 6.6 Dynamic Layout Maths

Card widths must be computed dynamically, never hardcoded, when the item count can vary.

```
card_width = floor((available_width - (n + 1) × gap) / n)
```

Where `n` = number of cards and `gap` = uniform spacing (between cards and on both outer edges). Hardcoded card widths produce negative gaps and element overlap when `n` increases; this is silent in SVG with no runtime error.

### 6.7 Height Validation

After setting viewBox height `H`, verify both independently:
- `card_bottom = top_offset + card_height`
- `badge_top = H - badge_offset`

Verify: `badge_top > card_bottom + minimum_desired_gap`. SVG clips to the viewBox silently; overlapping elements produce no warning.

### 6.8 Accessibility

Every SVG: `role="img"`, `aria-label` set to the infographic title. The `<p>` caption below the SVG provides descriptive text as HTML that screen readers and crawlers can access without parsing SVG.

### 6.9 Uniqueness Rule

Every article gets its own infographic component. Infographics are never shared across articles. The reason: an infographic is designed around one article's specific data and informational argument. This holds fully for the 13 hand-authored articles in the `ARTICLES` tuple; see 6.10 for the auto-generated path.

### 6.10 The Auto Path Exception

Articles drafted through `auto_generate_spec()` (used for any queue article without a hand-authored spec) cannot get a bespoke hand-built component from an unattended pipeline run. They get `infographic_type="auto"` instead, rendered by a single generic, data-driven component (`src/components/infographics/AutoInfographic.tsx`) fed by per-article structured content (title, caption, 4 items) that Claude still generates fresh for that specific article and saves to `scraper/data/blog/{id}_infographic.json`. The rendering code is shared, but the content is still unique per article. Hand-authored articles are unaffected and keep using their own dedicated components.

### 6.11 Emoji Icons in SVG

Emoji may be used in SVG `<text>` elements. Font size must not exceed 22px in the 700-unit viewBox. Larger sizes cause clipping and OS-specific baseline inconsistencies because emoji glyphs are rendered by the OS emoji font, not the declared `fontFamily`.

---

## 7. Interactive Widget Components

### 7.1 When to Include a Widget

A widget is appropriate when: (a) the article's core question has a branching answer that depends on the reader's specific situation, and (b) the reader cannot determine the correct branch from the article text alone without working through the conditions themselves. A widget that replicates what two prose paragraphs already make clear adds nothing. A widget that saves the reader from reading six conditional paragraphs adds real value.

The decision to include a widget belongs to the article author / generation prompt, not to a rule. The question to ask: "Does this reader need to interact with something to get a personalised answer, or can they get the answer from reading?" If the latter, skip the widget.

### 7.2 Widget Types Available

- `price-calculator` — dual-range sliders for lesson count and price per lesson; computes total cost estimate with fixed fee components; includes a disclaimer about estimates
- `uk-licence-checker` — 3-question branching tree (full licence? valid? residence timing relative to a policy date); 4 result states
- `eu-exchange-checker` — 3-question branching (EU citizenship? residence? licence validity); 4 result states
- `foreigner-path-checker` — single-select 4-option router; shows numbered steps per path

To add a new widget: create the component in `src/components/widgets/` as `"use client"`, populate both locale strings in `DATA`, add the widget ID to the BlogProse lookup table with locale-specific pill labels, add the case to BlogProse's widget switch.

### 7.3 Architecture

`"use client"` React component. State with `useState`. Only `locale` prop. All user-visible strings in a bilingual `DATA` object. No hardcoded strings in JSX.

### 7.4 Wrapper Appearance (BlogProse)

BlogProse wraps every widget in:
- 2px border, brand colour at 40% opacity (`border-brand/40`)
- Background, brand colour at 4% opacity (`bg-brand/[0.04]`)
- 12px padding on all sides (`p-3`) between outer border and widget card edge
- `rounded-2xl`, `shadow-sm`

A floating pill label sits at `-top-3.5` above the outer border. The label is specific to each widget — not "Interactive tool". Each widget ID maps to locale-specific labels in a lookup table inside BlogProse. If a widget ID is not found in the table, the renderer falls back to "Interactive tool" / locale equivalent — this fallback must never be the intended state for a shipped widget. Update the lookup table before deployment.

### 7.5 Result States

Every possible question path must terminate in an explicit result. No dead-end paths. Each result card contains: a headline, 1-2 interpretive sentences, a concrete next step. A result saying only "you qualify" is incomplete.

### 7.6 Restart Button

Every widget must include a restart button in every result state. It clears all state and returns to the initial question. Visually distinct from result content, clearly labelled. No restart button = readers exploring multiple scenarios must reload the page.

### 7.7 Question Depth

2-4 questions before a result. More than 4 causes abandonment. Stop asking as soon as the result is determined.

### 7.8 One Widget Per Article

One widget maximum per article. Placed in the H2 section whose heading most directly relates to the widget's decision logic. Must follow at least one prose paragraph in that section.

### 7.9 Locale Parity

Both locales must be fully supported before the widget ships. Empty secondary-locale strings are a bug, not a partial implementation.

---

## 8. Secondary-Locale Writing Rules

Articles are generated independently per locale via separate API calls. The secondary-locale article is not a translation. Both share the same ArticleSpec facts, section order, and media placements, but prose is generated independently in each locale.

### 8.1 Word Count Floors

- Per H2 section: 250-350 words (primary: 200-300)
- Body (excluding FAQ): 2,300+ words (primary: 2,000+)
- Grand total: 2,500+ words (primary: 2,200+)

The reason for higher floors: secondary-locale Unicode characters tokenize at 2-3× the cost of primary-locale Latin characters. The API call uses `max_tokens=12000`. Higher word floors ensure the model generates enough content within the token budget without truncating.

### 8.2 Per-Section Word Count Reminder

The user prompt for secondary-locale generation includes a per-section word count reminder listing every section title with its required range. A generic "write 250-350 words per section" is insufficient; the reminder must enumerate all 8 sections individually. Without per-section guidance, the model front-loads early sections and thins later ones.

### 8.3 Section Count

Exactly 8 H2 sections. The two extra sections vs. the primary locale must cover genuinely additive subtopics.

### 8.4 Post-Processing Substitutions

After generation, rule-based substitutions apply to the secondary locale output:
- The most overused additive connector word (model-default equivalent of "furthermore") is replaced globally with a near-synonym that passes the banned phrase check.
- Three grammatical forms of the adverb meaning "additionally" are replaced with contextually appropriate synonyms: standalone sentence-starter form, noun-phrase modifier form, time-noun modifier form.

Post-processing runs before the QA gate. It is a belt-and-braces backstop, not a licence to generate banned phrases and rely on substitution.

### 8.5 Banned Phrases (Secondary Locale)

The secondary locale bans equivalents of all the primary-locale banned phrases (see Section 3.4), plus a compound phrase meaning "in a world that is constantly changing" — a common LLM opener in the secondary locale. Locale is inferred from the filename suffix: `_en.md` → primary locale; `_el.md` → secondary locale.

---

## 9. QA Gate

Automated script run on every generated markdown file. All failures are hard failures: any single failure exits with status 1 and blocks publication. Two further hard-gate checks in `qa_blog.py`: a markdown file missing a `{{widget:` token or missing a `{{infographic:` token now fails QA, at the same severity as the checks below.

### 9.1 H1 Check

Fails if any line starts with `# ` (single `#` followed by space). H1 in the markdown body creates a duplicate heading — the page already renders H1 from metadata.

### 9.2 H3 Check

Fails if any line starts with `### `. H3 is not rendered by BlogProse; it appears as raw `###` text.

### 9.3 Em-Dash Check

Fails if any line contains `—` (U+2014). Confirms post-processing succeeded or the original was clean.

### 9.4 Body Word Count

Splits at the FAQ heading; counts words above it. Minimums: 2,000 (primary locale), 2,300 (secondary locale).

### 9.5 Total Word Count

Full article including FAQ. Minimums: 2,200 (primary locale), 2,500 (secondary locale).

### 9.6 FAQ Presence

Fails if no line exactly matches `## FAQ` (primary, case-insensitive) or the secondary locale FAQ heading string.

### 9.7 FAQ Question Count

Counts standalone bold lines within the FAQ section. A standalone bold line: the entire line matches `**...**`. Count must equal exactly 5. The FAQ schema generator expects exactly 5 entries.

### 9.8 Banned Phrase Check

Case-insensitive substring match against the locale-specific banned list. Any match fails. Reports the matched phrase and line numbers.

### 9.9 What the Gate Does Not Check

Sentence length, reading level, factual accuracy, image alt text, internal link presence, link count, external link presence, media token placement, per-section word count. These depend on model instruction-following and editorial review. Add new gate checks only for properties verifiable by pattern matching.

---

## 10. SEO and Metadata Fields

### 10.1 Article ID

URL-slug format: lowercase ASCII, hyphens, digits only. Same ID for both locales; locale prefix is applied by the router. The primary-locale path is canonical.

### 10.2 Title Fields (`title_en`, `title_el`)

50-60 characters. Primary keyword used once, naturally. Do not repeat in H1 in the markdown body.

### 10.3 Excerpt Fields (`excerpt_en`, `excerpt_el`)

Used in ArticleCard and list pages. 1-2 sentences, 120-160 characters. Must stand alone without context from the article.

### 10.4 Meta Description Fields (`metaDescription_en`, `metaDescription_el`)

Used in `<meta name="description">` and OG description. 140-160 characters. Answers the primary question in one sentence; include a secondary benefit or qualifier in the second sentence.

### 10.5 Hero Image Fields

`heroImagePath` — path to the hero image in `/public/`.
`heroImageAlt_en` / `heroImageAlt_el` — descriptive alt text per locale.
`heroCaption_en` / `heroCaption_el` — attribution caption per locale.

### 10.6 Image Credits Record (`imageCredits`)

Optional record keyed by image filename without extension: `"image2"`, `"inline-1"`, `"inline-2"`. Each entry: `{ alt_en, alt_el, caption_en, caption_el }`. If present, the page uses this for injected images rather than generic fallbacks. Must be populated for every article that uses injected images.

### 10.7 Published and Modified Dates

`publishedDate` — the date the article merged to main (ISO 8601). `modifiedDate` — the date of the last substantive edit. Used in Article JSON-LD (`datePublished`, `dateModified`). Do not set `publishedDate` to the generation date; set it to the merge date.

### 10.8 Author Fields (`author`, `authorSlug`)

`author` — display name string (rendered in the byline).
`authorSlug` — key in the `AUTHORS` record in `authors.ts`. If `authorSlug` matches a known Author, the page renders the full AuthorBio card and links to the author profile. If it does not match, the page falls back to showing only the name in the byline with no card.

### 10.9 Related City and Related Slugs

`relatedCity` — links the article to a city for geographic filtering.
`relatedSlugs` — array of other article IDs shown as related content in prev/next navigation.

### 10.10 ArticleSpec Generation Fields

Fields used only by the generation prompt, not rendered on the page:

- `topic_en` / `topic_el` — short phrase summarising the subject
- `audience_en` / `audience_el` — one sentence describing the intended reader's knowledge level and situation
- `facts` — locale-independent tuple of verifiable claims the model must incorporate; use source directives instead of specific figures that may change
- `sections_en` / `sections_el` — ordered tuple of H2 heading strings; 6-8 for primary, exactly 8 for secondary
- `internal_links_en` / `internal_links_el` — ordered tuple of `(path, anchor)` pairs; all must appear in the article body
- `answer_en` / `answer_el` — optional verbatim opening paragraph
- `widget_id` — optional widget ID; one maximum per article
- `infographic_type` — optional infographic type; one maximum per article
- `youtube_id` — optional YouTube video ID
- `inline_image_queries` — optional tuple of stock photo search queries

---

## 11. Anti-Patterns

### 11.1 Widget Parked Before the FAQ

The widget token placed just above `## FAQ` because no more specific H2 was chosen. Result: widget appears at the bottom when reader engagement is lowest. Fix: identify the H2 whose heading most directly matches the widget's decision logic and place the token after the first prose paragraph in that section.

### 11.2 Generic Widget Pill Label

Widget ID not added to BlogProse's lookup table; renders with fallback "Interactive tool" label. Fix: update the lookup table with specific, action-oriented locale labels before deploying any new widget.

### 11.3 Two Media Tokens in One Section

Infographic and widget in the same H2. Creates a media pile-up; the section's word count falls short. Fix: each media element occupies a different H2.

### 11.4 Fixed Card Widths in SVG

Constant card widths overlap when item count increases. Fix: `floor((available_width - (n + 1) × gap) / n)`.

### 11.5 SVG Height Too Small

Bottom-anchored elements (badges, axis labels) overlap top-anchored elements (card bottoms). SVG clips silently. Fix: compute `card_bottom` and `badge_top` independently; verify gap before shipping.

### 11.6 H1 in Markdown Body

`# Title` at the top of the markdown creates a duplicate H1 and fails the QA gate. Fix: start the markdown body directly with the answer/summary paragraph.

### 11.7 H3 in Markdown Body

`### Sub-heading` appears as raw `###` text on the page. If a section needs sub-headings, it should be two H2 sections. Fix: split; update the ArticleSpec.

### 11.8 All Internal Links in a List

Links grouped in a "Related articles" bullet block. Reads as a directory; reduces per-link click-through; signals low editorial value. Fix: each link in prose, in a different paragraph.

### 11.9 Fewer Than 5 Internal Links

Article has 3 or 4 internal links because the ArticleSpec only specified that many. The minimum is 5. Fix: identify additional natural link targets during drafting; add them in prose.

### 11.10 No External High-DA Link

Article cites an official body or figure but does not link to the source. Fix: add one hyperlink to the most authoritative external source cited in the article.

### 11.11 FAQ Repeating Body Content

FAQ answers are summaries of body paragraphs. Fix: each FAQ answer must introduce at least one detail, exception, or next step not stated in the body.

### 11.12 Banned Phrase in Generated Output

Any phrase from the banned list appears in the output and fails the gate. The passage containing it should be rewritten with a specific, substantive sentence — not just the banned phrase removed and nothing put in its place.

### 11.13 Secondary-Locale Under-Count

Total word count passes but body count fails, or per-section lengths vary wildly. Fix: per-section word count reminder in the user prompt must list every section title individually.

### 11.14 Missing Widget Restart Button

Widget shows a result with no way to reset. Fix: every result state renders a clearly labelled restart button that resets all `useState` values.

### 11.15 Committing and Pushing in the Same Step

`git push` bundled with `git commit` without explicit instruction. The commit finalises content; the push deploys to production. These are separate decisions. Fix: stop after `git commit`; push only when explicitly asked.

### 11.16 Asserting File Existence Without Verifying

Claiming a file exists from session memory without running `ls`. Fix: always run `ls` on the target path before asserting presence. "The memory says it exists" is not the same as "it exists now."

### 11.17 Stale Figures in Facts

Embedding a specific regulatory fee, time limit, or qualifying date directly in the facts tuple. When the figure changes, the article becomes wrong. Fix: for any figure subject to change, write the fact as a directive: "Tell readers to confirm the current figure at [official body name]."

### 11.18 Author Fallback Left in Place

Article published with `authorSlug` pointing to a non-existent Author record; the page renders only the name with no bio card and no LinkedIn. Fix: create the Author record in `authors.ts` before the article is published. A missing author card is a visible EEAT failure.

### 11.19 Hedge Walls

A paragraph containing three or more hedging phrases ("may," "in some cases," "depending on your situation," "results vary") without any specific conditional. Signals the writer does not know the answer. Fix: state the condition explicitly ("if X, then Y; if not X, then Z"), or direct the reader to the official source.

### 11.20 Missing Attribution on Images

Stock photo published without photographer credit in the caption. Violates the image provider's terms; cannot be corrected silently after publication. Fix: always populate `imageCredits` for injected images; always include "Photo: Name." in inline image captions.

---

## 12. Content Generation Pipeline

The pipeline turns an `ArticleSpec` into a published page in four automated steps: generate content, fetch images, run QA, publish. Every step is scripted and repeatable. The only human input is authoring the `ArticleSpec` and (in review mode) approving the PR.

### 12.1 The Two-Registry Constraint

Every article must be registered in two places before it can be generated or rendered. Missing either registration causes a different silent failure.

**Registry 1 — `scraper/generate_blog.py` (`ARTICLES` tuple):** Controls content generation. An `ArticleSpec` here is what `generate_blog.py` and `publish_next.py` use to drive the API call. Without it, generation raises a `RuntimeError: no article spec found`.

**Registry 2 — `src/lib/blog.ts` (`BLOG_ARTICLES` array):** Controls the Next.js routes. A `BlogArticle` record here is what the page router uses to find the article, render metadata, and serve the URL. Without it, the page returns 404 even if the markdown file exists. The `publishedDate` in this record is set to the actual merge date, not the generation date.

These two registries must stay in sync on `id`. The `id` field is the primary key across both — it is the markdown filename stem and the `public/blog/{id}/` image directory name. Never change an `id` after an article is published; it breaks all existing URLs and image paths.

### 12.2 ArticleSpec Fields

`ArticleSpec` is a frozen dataclass in `scraper/generate_blog.py`. All fields are set at spec-authoring time; nothing is mutated at generation time.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | `str` | yes | Slug and filename stem. Lowercase hyphens only. |
| `topic_el` / `topic_en` | `str` | yes | Short subject phrase injected into the user prompt. Not rendered. |
| `title_el` / `title_en` | `str` | yes | Full article title. Passed to prompt for reference; must match `blog.ts`. |
| `audience_el` / `audience_en` | `str` | yes | One-sentence reader description. Sets the model's assumed knowledge level. |
| `facts` | `tuple[str, ...]` | yes | Locale-independent factual claims. All must appear in both locale articles. Use source directives, not stale figures. |
| `sections_el` / `sections_en` | `tuple[str, ...]` | yes | Ordered H2 headings. Model uses them exactly. 6-8 for primary locale, exactly 8 for secondary. |
| `internal_links_el` / `internal_links_en` | `tuple[tuple[str, str], ...]` | yes | `(path, anchor)` pairs. All must be woven into prose. |
| `answer_el` / `answer_en` | `str` | no | Verbatim opening paragraph. Copied word-for-word when supplied. |
| `widget_id` | `str` | no | Widget token to embed. Must match BlogProse's widget switch. The fixed reuse pool now includes a 6th type, `renewal-checker`. |
| `infographic_type` | `str` | no | Infographic token. Must match BlogProse's infographic switch. |
| `youtube_id` | `str` | no | YouTube video ID for an iframe embed. |
| `inline_image_queries` | `tuple[str, ...]` | no | Pexels search queries. One query per inline body image. |

The `facts`, `sections_*`, and `internal_links_*` fields are the editorial spine of the article. Time spent getting these right before generation reduces regeneration cycles to near-zero.

### 12.3 The `build_user_prompt()` Function

`build_user_prompt(article, locale)` assembles the user message sent to the model. It pulls the locale-specific fields, then builds labelled blocks in this order:

1. **Intro line** — "Write a long article about: {topic}" + "Audience: {audience}"
2. **Title** — "Title (for reference, do not output an H1): {title}"
3. **Answer block** — "ANSWER (copy this verbatim as your first paragraph): {answer}" — omitted when `answer` is empty
4. **Sections block** — labelled bullet list of H2 headings in order
5. **Facts block** — labelled bullet list of all facts
6. **Links block** — labelled bullet list of `anchor → path` pairs
7. **Images block** — emitted only when `inline_image_queries` is set and sidecar JSON exists; lists each image with its path, subject description, and photographer attribution string
8. **Infographic block** — emitted only when `infographic_type` is set; instructs placement after the most relevant H2
9. **Widget block** — emitted only when `widget_id` is set; instructs placement after the most relevant H2
10. **Video block** — emitted only when `youtube_id` is set
11. **Word count reminder** — secondary locale only: "Check before submitting: every section must have 280-350 words. Total excluding FAQ: 2300+ words." This block is appended at the end of the prompt to maximise its recency effect.

The prompt ends with: "Now write the article body. Markdown only. No H1."

### 12.4 The API Call

`_call_anthropic()` sends a single `messages.create` call per (article, locale) pair:

- **Model:** `claude-sonnet-4-6` (configurable via `--model` flag)
- **max_tokens:** `12000` — set high because secondary-locale Unicode characters tokenize at 2-3× the rate of Latin text; 12,000 tokens accommodates a 2,500-word secondary-locale article with overhead
- **System prompt:** `SYSTEM_PROMPT_EL` or `SYSTEM_PROMPT_EN` depending on locale
- **User message:** output of `build_user_prompt()`

The response is assembled from all `text`-type content blocks, stripped of leading/trailing whitespace, and a trailing newline is appended. The raw markdown is passed immediately to `_post_process()` before being written to disk.

### 12.5 Post-Processing

`_post_process(md, locale)` applies two passes:

**Pass 1 (all locales):** `md.replace("—", " - ")` — replaces every em-dash with a spaced hyphen. This is a belt-and-braces backstop; articles should not contain em-dashes in the first place.

**Pass 2 (secondary locale only):** Four string substitutions applied in order:
1. `"Επιπλέον,"` → `"Ακόμα,"` — sentence-opener form of the banned additive connector
2. `"επιπλέον χρέωση"` → `"πρόσθετη χρέωση"` — modifier of fee noun
3. `"επιπλέον χρόνο"` → `"παραπάνω χρόνο"` — modifier of time noun
4. `"επιπλέον"` → `"έξτρα"` — any remaining instance

The order matters: the more specific multi-word forms are replaced first so the catch-all single-word replacement on line 4 does not corrupt them.

### 12.6 CLI Usage for `generate_blog.py`

```bash
# Generate one article, both locales
uv run python -m scraper.generate_blog --article-id <id>

# Generate one article, one locale only
uv run python -m scraper.generate_blog --article-id <id> --locale en

# Regenerate all articles (overwrite existing files)
uv run python -m scraper.generate_blog --overwrite

# Generate all pending articles, Greek only
uv run python -m scraper.generate_blog --locale el
```

By default, the script skips any `(article_id, locale)` pair where the output file already exists. Pass `--overwrite` to force regeneration. This default prevents accidental regeneration of approved content.

### 12.7 QA Gate Checks and Thresholds

`scraper/qa_blog.py` runs pattern-based checks on a markdown file. Locale is inferred from the filename suffix (`_en.md` or `_el.md`). All checks are hard failures; any single failure causes exit code 1.

| Check | Pattern | Threshold |
|---|---|---|
| H1 presence | `^# [^#]` | Must be absent |
| H3 presence | `^#{3} ` | Must be absent |
| Em-dash | `—` (U+2014) in any line | Must be absent |
| Body word count | Words before FAQ heading | ≥ 2,000 (both locales) |
| Total word count | All words in file | ≥ 2,200 (both locales) |
| FAQ heading | `^## FAQ$` (EN, case-insensitive) or `^## Συχνές Ερωτήσεις$` (EL) | Must be present |
| FAQ question count | Lines matching `^\*\*.+\*\*\s*$` inside FAQ | Must equal exactly 5 |
| Banned phrases | Case-insensitive substring match | Zero matches |

**Primary-locale banned phrases:** furthermore, moreover, it is worth noting, in conclusion, it goes without saying, it is important to note, navigating, delve, crucial, ensure, seamless, in today's fast-paced world, rest assured.

**Secondary-locale banned phrases:** επιπλέον, επιπροσθέτως, αξίζει να σημειωθεί, εν κατακλείδι, δεν χρειάζεται να ειπωθεί, πλοηγηθείτε, βυθιστείτε, κρίσιμο, εξασφαλίστε, απρόσκοπτο, σε έναν κόσμο που αλλάζει συνεχώς.

**CLI usage:**
```bash
# Check both locales for one article
uv run python -m scraper.qa_blog --article-id <id>

# Check a specific file
uv run python -m scraper.qa_blog scraper/data/blog/some-article_en.md
```

### 12.8 `blog-queue.json` Structure

`blog-queue.json` is the publication queue. It lives at the repo root and is committed with every publish operation to track state across runs and machines.

```json
{
  "last_publish_date": "2026-06-27",
  "settings": {
    "cadence_days": 2,
    "publish_mode": "auto",
    "consecutive_clean_approvals": 0,
    "next_publish_at": "2026-06-29T07:00:00Z"
  },
  "state": {
    "open_pr_number": null,
    "open_pr_article_id": null
  },
  "articles": [ ... ]
}
```

**`settings.cadence_days`:** Minimum days between publishes. The scheduler enforces this via `next_publish_at`.

**`settings.publish_mode`:** Either `"review"` or `"auto"`. Controls the publish flow. See Section 12.10.

**`settings.next_publish_at`:** ISO 8601 UTC datetime. The scheduler will not run before this time. After each publish in auto mode, this is advanced by `cadence_days` + 65 minutes from the previous scheduled time (not from wall clock now), ensuring the cadence stays on schedule even if a run is delayed.

**`state.open_pr_number`:** In review mode, only one PR can be open at a time. If this is non-null, `publish_next.py` exits immediately without generating a new article. Must be set to `null` after the PR is merged or closed before the next article can be picked up.

**Article entry fields:** Each article in the `articles` array carries: `id`, `priority`, `status` (`"pending"` / `"in_review"` / `"published"`), `title_en`, `title_el`, `slug_en`, `slug_el`, `keyword`, `volume`, `cluster`, `category_id`, `hero_query`, `excerpt_en`, `excerpt_el`, `meta_description_en`, `meta_description_el`, `hero_alt_en`, `hero_alt_el`, and tracking fields `published_at`, `pr_number`, `pr_created_at`.

`publish_next.py` picks the pending article with the lowest `priority` value. Priority 0 articles are published first; higher numbers wait.

### 12.9 `publish_next.py` — The Orchestrator

`publish_next.py` runs the full pipeline end-to-end in four steps:

**Step 1 — Generate:** Calls `generate_blog.py --article-id <id> --overwrite` for the selected article. Both locales are generated. Fails hard if the article has no spec in `ARTICLES`.

**Step 2 — Fetch images:** Calls `fetch_blog_hero.py --slug <id> --query <hero_query>` to download `hero.jpg` into `public/blog/<id>/`. Then calls `fetch_article_inline_images()` for any `inline_image_queries` in the spec, saving `inline-1.jpg`, `inline-2.jpg`, etc. alongside their `.json` sidecar files containing photographer attribution metadata. The sidecar JSON is what `build_user_prompt()` reads to embed photographer names in captions.

**Step 3 — QA with one retry:** Runs `qa_blog.py --article-id <id>`. If it fails, `generate_blog.py` is run once more automatically (`--overwrite`) and QA is re-run. If QA fails a second time, the article is left in `"pending"` status and the script exits with code 1. No article that fails QA twice is published automatically.

**Step 4 — Publish:** Behaviour depends on `publish_mode`.

**CLI usage:**
```bash
# Normal run — uses publish_mode from blog-queue.json
uv run python -m scraper.publish_next

# Override publish mode
uv run python -m scraper.publish_next --publish-mode review
uv run python -m scraper.publish_next --publish-mode auto

# Dry run — prints what would happen, touches nothing
uv run python -m scraper.publish_next --dry-run
```

### 12.10 Review Mode vs Auto Mode

**Review mode (`"publish_mode": "review"`):**

1. Creates a git branch `blog/<article-id>`
2. Commits the two markdown files, hero image, any inline images, and the updated `blog-queue.json` to that branch
3. Pushes the branch and opens a GitHub PR via `gh pr create` with a review checklist
4. Switches back to `main` and commits a tracking update to `blog-queue.json` recording the PR number
5. Blocks further runs until the PR is merged or `state.open_pr_number` is manually cleared

The PR description contains a checklist: read EN article, read EL article, check hero image quality. The reviewer approves by merging. A GitHub Actions workflow (`blog-finalize.yml`) fires on merge and inserts the `blog.ts` entry using the actual merge timestamp as `publishedDate`.

**Auto mode (`"publish_mode": "auto"`):**

1. Generates the `blog.ts` entry string using today's date as `publishedDate`
2. Inserts the entry directly into `src/lib/blog.ts` above the closing `];`
3. Marks the article `"published"` in `blog-queue.json` and advances `next_publish_at`
4. Stages all files: both markdown files, hero image, inline images, `blog.ts`, `blog-queue.json`
5. Commits with message `feat(blog): publish <article-id>` and pushes to `main`
6. Vercel detects the push and deploys automatically

Auto mode requires high confidence in the generation quality. The intended path to auto mode is: run several articles in review mode, approve them without edits, and once confidence is established, switch `publish_mode` to `"auto"`.

### 12.11 GitHub Actions Schedule

A GitHub Actions workflow triggers `publish_next.py` on a schedule. The workflow checks `next_publish_at` in `blog-queue.json` before doing anything; if the current UTC time is before `next_publish_at`, the cadence guard exits early. This means the cron expression can run more frequently than the cadence without over-publishing — the queue's internal clock is the authoritative gate, not the cron interval.

The workflow sets `ANTHROPIC_API_KEY` and `PEXELS_API_KEY` from repository secrets. On a successful auto-mode publish, it emits `published_url_el`, `published_url_en`, and `published_title` as GitHub Actions outputs, which downstream steps can use for notifications or link-checking.

### 12.12 Adding a New Article End-to-End

To add one article to the pipeline from scratch:

**1. Author the `ArticleSpec`** in `scraper/generate_blog.py`, appending to the `ARTICLES` tuple. Fill every required field. Write facts as source directives for any figures that can change. Verify `sections_el` has exactly 8 entries. Verify `internal_links_*` has at least 5 entries per locale.

**2. Add the queue entry** to `blog-queue.json` in the `articles` array with `"status": "pending"`. Set `priority` to a number higher than all currently pending articles if the article should wait, or lower to publish it next. Set `hero_query` to a specific landscape-oriented search phrase for the hero image.

**3. Test generation locally:**
```bash
uv run python -m scraper.generate_blog --article-id <id> --overwrite
uv run python -m scraper.qa_blog --article-id <id>
```
Fix any QA failures before committing the spec. Common failures on first generation: missing internal links (model did not use all of them), word count under threshold, banned phrase. Each requires either a prompt tweak in the `facts` block or a `sections` restructure.

**4. Add the `BlogArticle` entry** to `src/lib/blog.ts`. Set `publishedDate` to today (it will be overwritten by `blog-finalize.yml` on the actual merge date in review mode; in auto mode `publish_next.py` sets it). Set `authorSlug` to a key that exists in `src/lib/authors.ts`. Populate `heroImageAlt_el`, `heroImageAlt_en`, `heroCaption_el`, `heroCaption_en`. If the article uses inline images, populate `imageCredits`.

**5. Run the full pipeline** via `publish_next.py` (or trigger the GitHub Actions workflow). In review mode, read both locale articles in full before approving the PR.

### 12.13 PUBLISH_MODE Toggle

`publish_mode` in `blog-queue.json` is the single switch that controls whether articles go directly to main or via PR review. Change it by editing the JSON:

```json
"settings": {
  "publish_mode": "auto"
}
```

or

```json
"settings": {
  "publish_mode": "review"
}
```

The `--publish-mode` flag on `publish_next.py` overrides the JSON setting for a single run without persisting the change. Use the flag for one-off overrides; edit the JSON to change the standing default.

Do not switch to auto mode until: (a) at least three articles have passed review without any edits, and (b) the QA gate has caught every generation failure before it reached review. The auto mode commit message `feat(blog): publish <id>` triggers Vercel immediately; there is no staging step.

---

*Word count: approximately 8,900 words.*
