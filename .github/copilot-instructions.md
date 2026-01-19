# Australian Ad Observatory Dashboard - Copilot Instructions

## Project Overview

SvelteKit 2 + Svelte 5 static site dashboard for the Australian Ad Observatory. Connects to AWS Lambda APIs for mobile ad tracking research. Built with TypeScript, Tailwind CSS, and Shadcn-Svelte components.

## Architecture

### API Layer (`src/lib/api/`)

- **`client.ts`**: OpenAPI-typed client via `openapi-fetch`. Types generated from `swagger.yaml`
- **`openapi-paths.ts`**: Auto-generated types - regenerate with `npm run docgen`
- **`session/session.svelte.ts`**: Central session class managing auth, ads data, and API adapters
- **`auth/auth.svelte.ts`**: JWT-based authentication singleton (`auth` export)

```typescript
// API usage pattern
import { client } from '$lib/api/client';
const { data, error } = await client.GET('/endpoint');
```

### State Management Pattern

Uses Svelte 5 runes with class-based singletons for global state:

```typescript
// src/lib/states/theme.svelte.ts - pattern for global state
export const theme = $state<{ mode: 'light' | 'dark' }>({ mode: 'light' });

// src/lib/api/auth/auth.svelte.ts - pattern for complex state
export class Authentication {
	token = $state<string | null>(null);
	currentUser = $derived.by(() => {
		/* decode JWT */
	});
}
export const auth = new Authentication();
```

### Component Structure

- **`src/lib/components/ui/`**: Shadcn-Svelte primitives (from `npx shadcn-svelte@next add`)
- **`src/lib/components/`**: App-specific components (sidebar, header, toasts)
- **`src/lib/hooks/`**: Reactive utilities using `.svelte.ts` extension

### Routing & Auth

- Protected routes defined in [protected.config.ts](src/routes/protected.config.ts)
- Role-based access: `guest`, `user`, `admin`
- Auth redirects handled in root `+layout.svelte`

## Key Conventions

### File Naming

- `.svelte.ts` for files with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Regular `.ts` for pure TypeScript utilities
- Lowercase hyphenated component files: `app-sidebar.svelte`

### Path Utilities

Always use `withBase()` for internal navigation to support subdirectory deployment:

```typescript
import { withBase } from '$lib/utils';
goto(withBase('/mobile-observations'));
```

### Styling

- Use `cn()` utility from `$lib/utils` to merge Tailwind classes
- Follow Shadcn color conventions: `bg-primary`, `text-muted-foreground`
- Dark mode via `dark` class on body, controlled by `theme.mode`

### Toasts

```typescript
import { pushToast } from '$lib/components/toasts/toasts.svelte';
pushToast({ type: 'error', message: 'Something went wrong', timeout: 5000 });
```

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Static build to /build
npm run check        # TypeScript + Svelte validation
npm run docgen       # Regenerate OpenAPI types from swagger.yaml
npm run storybook    # Component development
npm run test:e2e     # Playwright tests
```

## Configuration

- **`src/app.config.js`**: Environment-specific API URLs
- **`svelte.config.js`**: Static adapter, `BASE_PATH` for subdirectory deploys
- **`components.json`**: Shadcn-Svelte config (aliases: `$lib/components/ui`)

## Important Patterns

### Adding New UI Components

```bash
npx shadcn-svelte@next add button  # Adds to src/lib/components/ui/
```

### API Changes

1. Update `swagger.yaml` at project root
2. Run `npm run docgen`
3. Use generated types with `client.GET/POST/etc`

### New Protected Routes

Add to `protectedRoutes` in [protected.config.ts](src/routes/protected.config.ts):

```typescript
'/new-route': { allowedRoles: ['user', 'admin'] }
```
