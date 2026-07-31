You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Naming Conventions

- Use **kebab-case** for all file and folder names (e.g., `project-card.component.ts`, `contact.service.ts`, `project-detail/`)
- Use **PascalCase** for class and interface names (e.g., `ProjectCardComponent`, `ContactForm`)
- Use **camelCase** for variables, functions, and signal names
- Suffix files according to their type: `.component.ts`, `.service.ts`, `.guard.ts`, `.interceptor.ts`, `.interface.ts`

## Code Comments

- Write all code comments in **English**
- Only comment when the **why** is non-obvious — never describe what the code does, only why
- Use single-line comments (`//`) for inline explanations
- Avoid multi-line comment blocks and JSDoc unless documenting a public API

## Project Structure

```
src/
├── environments/
│   ├── environment.ts              # Production environment variables
│   └── environment.development.ts  # Development environment variables
└── app/
    ├── core/
    │   ├── guards/        # Route protection (e.g., admin.guard.ts)
    │   ├── interceptors/  # HTTP interceptors (e.g., error.interceptor.ts)
    │   └── services/      # Singleton app-wide services (e.g., seo.service.ts, contact.service.ts)
    ├── shared/
    │   ├── components/    # Reusable UI components (e.g., header, footer, project-card)
    │   ├── directives/    # Reusable behavior (e.g., GSAP scroll-reveal, stagger-in lists)
    │   └── interfaces/    # Shared TypeScript interfaces and types
    └── pages/             # One folder per route/view (e.g., home/, projects/, project-detail/, contact/)
```

### Where to place each file

- **Route components** (pages/views) → `app/pages/[page-name]/`
- **Reusable UI components** (used in 2+ pages) → `app/shared/components/[component-name]/`
- **Reusable animation directives** (e.g., GSAP scroll-reveal) → `app/shared/directives/`
- **Route guards** → `app/core/guards/`
- **HTTP interceptors** → `app/core/interceptors/`
- **Global singleton services** (SEO, analytics, contact, etc.) → `app/core/services/`
- **TypeScript interfaces and types** → `app/shared/interfaces/`
- **Environment config** → `src/environments/`
- **Page-specific services** (only used in one page) → inside that page's folder

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v19+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## State Management & Signals

- Use `signal()` for local component state
- Use `computed()` for derived state — never recalculate manually
- Use `effect()` for side effects that react to signal changes (e.g., syncing to localStorage)
- Use `toSignal()` to convert Observables to signals — prefer it over the async pipe when possible
- Use `toObservable()` when a signal must be passed to an RxJS pipeline
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals — use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic — delegate it to the component class
- Use native control flow (`@if`, `@else`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@let` to declare local template variables and avoid repeating expressions
- Use `@defer` to lazily load heavy components (e.g., below-the-fold sections) — always define `@loading`, `@error`, and `@placeholder` blocks
- Use `track` with a unique identifier in `@for` loops (e.g., `track project.id`)
- Use the async pipe to handle observables that aren't already converted with `toSignal()`

## HTTP

- Use `provideHttpClient(withFetch(), withInterceptors([...]))` in `app.config.ts` — never `HttpClientModule`
- Write interceptors as **functional interceptors** (`HttpInterceptorFn`), not class-based

## Routing & Guards

- Use `loadComponent` for lazy-loaded routes, not `loadChildren` with NgModules
- Write guards as **functional guards** (`CanActivateFn`), not class-based (`CanActivate`)
- Write resolvers as **functional resolvers** (`ResolveFn`), not class-based

## Environment

- Always import environment variables from `src/environments/environment.ts`
- Never hardcode API URLs, analytics IDs, or secrets — always use environment files

## Formatting

- Formatting is enforced by Prettier (`.prettierrc`) — never hand-format code; run `npx prettier --write .` or let the editor format on save
- Config: single quotes, 100-character line width, and the `angular` parser for `.html` templates

## Testing

- Tests run with **Vitest** (`npm test`) — co-locate `*.spec.ts` files next to the file they test
- For a portfolio, prioritize tests where there's real logic: the contact form (validation, submit/error states) and non-trivial service logic — don't write tests for purely presentational components just for coverage
- Test component behavior and output, not implementation details (e.g., assert the error message renders when the form is invalid, not that a specific internal signal was set)
- GSAP animations are not deterministic in the jsdom test environment (no real `requestAnimationFrame`) — never assert on animation state in a test; test the component logic instead and rely on `gsap.context().revert()` on destroy to stop tweens from leaking between tests

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Prefer inline templates for small components
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## HTTP Service Patterns

- Each service maps to one backend resource (e.g., `contact.service.ts` → `/api/contact`)
- Always type HTTP responses, e.g. `this.http.post<ContactResponse>(...)`
- Never call HTTP inside components — always delegate to a service
- Always use `environment.apiUrl` as the base URL — never hardcode endpoints
- Model async state explicitly with signals, e.g. for a form submission:
  ```ts
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);
  ```
- Use `toSignal()` for simple read-only calls that don't need manual triggering
- Use `httpResource()` for reactive data fetching tied to signal inputs
- Use `takeUntilDestroyed()` to automatically unsubscribe from observables in services

## Error Handling

- Use a **functional HTTP interceptor** (`HttpInterceptorFn`) to catch and normalize HTTP errors
- In services, always use `catchError` to handle errors and update the `error` signal
- Use `HttpErrorResponse` for typed HTTP error handling — never use `any`
- Never expose raw error objects or stack traces in the UI — always show a user-friendly message
- Reset the `error` signal to `null` at the start of each new request

## Forms

- Prefer **Signal Forms** (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer **typed Reactive Forms** over Template-driven ones: `FormGroup<{ email: FormControl<string> }>`
- Use `inject(FormBuilder)` with `.nonNullable` to avoid null values in controls
- Define all validators in the form definition, not in the template
- Use a `computed()` to expose field error state to the template instead of repeating validation checks inline
- Never access form values without checking validity first
- Use `form.getRawValue()` instead of `form.value` to include disabled controls
- Always mark all controls as touched before showing validation errors on submit

## Tailwind CSS

- **Never use inline `style` attributes** — always use Tailwind utility classes
- **Class order convention** (keeps templates readable):
  1. Layout: `block`, `flex`, `grid`, `hidden`
  2. Flexbox/Grid: `flex-col`, `items-center`, `gap-4`, `col-span-2`
  3. Sizing: `w-full`, `h-screen`, `max-w-lg`
  4. Spacing: `p-4`, `mt-2`, `mx-auto`
  5. Typography: `text-lg`, `font-bold`, `text-center`
  6. Colors: `bg-white`, `text-gray-900`, `border-gray-200`
  7. Borders & effects: `rounded-lg`, `shadow-md`, `opacity-50`
  8. Responsive & state: `sm:flex-row`, `hover:bg-blue-600`, `focus:ring-2`
- Define project design tokens (brand colors, fonts, spacing) using `@theme` in `styles.css` — never hardcode color values in classes
- Use `@apply` only in `styles.css` for truly global repeated patterns (e.g., a `.btn-primary` reused everywhere) — avoid it inside components
- Use Angular `class` bindings for conditional classes — never concatenate strings manually:
  ```html
  <button [class.opacity-50]="sending()" [class.cursor-not-allowed]="sending()">
  ```
- Avoid arbitrary values like `w-[347px]` — always prefer design tokens or standard scale values

## Server-Side Rendering (SSR)

This project uses SSR. Code runs on **both server and browser** — never assume a browser environment.

### Browser-only APIs
- Never access `window`, `document`, `localStorage`, `sessionStorage`, or `navigator` directly
- Always guard browser-only code with `isPlatformBrowser()`:
  ```ts
  private platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(this.platformId)) {
    // safe to use window, localStorage, etc.
  }
  ```
- Do not assume non-deterministic globals like `new Date()` or `Math.random()` produce the same value on server and client — using them directly in a template can cause hydration mismatches

### DOM Manipulation
- Use `afterNextRender()` for any code that must run after the first browser render (e.g., initializing third-party libraries, reading element dimensions)
- Use `afterRender()` for code that must run after every render cycle
- Never manipulate the DOM directly in `ngOnInit` or `constructor` — it runs on the server too

### Effects & Signals with SSR
- `effect()` that access browser APIs must be wrapped with an `isPlatformBrowser()` check inside

### SEO (key reason for using SSR)
- Use Angular's `Title` service to set the page title on every routable page
- Use Angular's `Meta` service to set `description`, `og:title`, `og:image` meta tags on every routable page
- Set title and meta tags in the component that corresponds to each route, not in a global place

### HTTP & Transfer State
- HTTP calls made during SSR run on the server — Angular's `HttpClient` with `withFetch()` handles transfer state automatically, avoiding duplicate requests on the client
- Never rely on cookies or auth headers being present in SSR requests unless explicitly forwarded via an interceptor

## Animations (GSAP)

- Import `gsap` directly from the `gsap` package — there is no official Angular wrapper (only `@gsap/react` is official), and third-party community wrappers add an unnecessary layer for this project
- All plugins (`ScrollTrigger`, `Flip`, `Draggable`, `SplitText`, etc.) ship in the same free `gsap` package since v3.13 — no separate install, license file, or private registry needed
- Import only the plugins actually used (e.g., `import { ScrollTrigger } from 'gsap/ScrollTrigger'`) instead of `gsap/all`, and register each once with `gsap.registerPlugin(...)`
- Never initialize GSAP on the server — guard all animation setup with `isPlatformBrowser()` and create tweens inside `afterNextRender()`, not in `ngOnInit()` or the constructor
- Scope each component's animations with `gsap.context()` and revert it via `DestroyRef`'s `onDestroy()` (or `ngOnDestroy()`) to kill all tweens, timelines, and ScrollTriggers it created
- Wrap tween creation and ticking in `NgZone.runOutsideAngular()` when zone.js is active — GSAP's rAF loop shouldn't trigger Angular change detection on every frame
- Never drive component state from a GSAP callback (`onUpdate`, `onComplete`) directly — write to a `signal()` and let Angular react to it normally
- Respect `prefers-reduced-motion`: check it with `matchMedia('(prefers-reduced-motion: reduce)')` and skip or shorten non-essential animations (parallax, auto-playing loops, scroll-linked motion) for users who request it
- Set the pre-animation state (e.g., `opacity-0`, initial `translate-y`) via a Tailwind class already present in the SSR-rendered markup, not via `gsap.set()` — this avoids a flash of unanimated content before the client JS hydrates and GSAP takes over
- Encapsulate reusable animation behavior (e.g., scroll-reveal, stagger-in lists) in a directive under `shared/directives/` instead of duplicating tween setup across components
