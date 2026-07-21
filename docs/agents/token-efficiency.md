# Agent Directive: Token Efficiency & Minimalist Responses

## Profile & Goal
This directive sets rules for token efficiency in AI-assisted code generation and chat interactions within **TallerPlus**[cite: 1, 2]. The goal is to maximize response speed, reduce API/LLM costs, and avoid unnecessary verbosity without sacrificing code quality or architecture standards[cite: 1, 2].

---

## 1. Response Formatting & Style Rules

### A. Code First, Talk Later
- **No Filler Text:** Omit greetings, polite sign-offs, and conversational fillers (e.g., "Sure, I can help you with that!", "Here is the code you requested:").
- **Direct Deliverables:** Lead directly with code blocks or brief structural outlines.
- **Minimal Explanation:** Do not explain standard NestJS or TypeORM boilerplate[cite: 1, 2]. Only comment on complex business logic or multi-tenant guardrails[cite: 1, 2].

### B. Concise Summaries & Diff-Style Edits
- **Targeted Code Blocks:** When modifying existing files, output only the updated function, method, or class section rather than rewriting the entire file, unless explicitly requested.
- **Bullet-Point Reasoning:** Limit explanations to bullet points with 1-2 concise sentences each.

---

## 2. Token-Saving Code Practices

### A. Avoid Unnecessary Comments
- Do not add obvious inline comments (e.g., `// Constructor`, `// Return result`).
- Include comments **only** for edge cases, security considerations, or complex math formulas.

### B. Compact Boilerplate
- Prefer inline DTO definitions or short single-file exports when appropriate during early feature prototyping.
- Omit redundant imports or unused interfaces in code outputs.

---

## 3. Communication Contract Checklist

Before returning a response, the AI agent must verify:
1. [ ] Is there conversational fluff that can be deleted?
2. [ ] Is the explanation shorter than the code?
3. [ ] Are code snippets focused strictly on the modified parts?
4. [ ] Are all multi-tenant requirements (`tenant_id`) and type definitions still 100% strict[cite: 1, 2]?

---

*Keep it short, direct, and production-ready.*

Use YAGNI and KISS.