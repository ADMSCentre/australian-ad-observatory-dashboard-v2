# Notes

- Use Australian English spelling in your commit messages.
- Add icons where appropriate to make your commit messages more readable.

# Make Meaningful Git Commits

## Understand the Purpose
- **Atomic Changes**: Each commit should represent a single, logical change.
- **Descriptive History**: Helps others understand why changes were made.

## Write Clear Messages
- **Imperative Mood**: Start with a verb (e.g., "Add", "Fix").
- **Concise but Descriptive**: Summarize the commit in a few words.

## Structure Your Message
- **Title (50 chars or less)**: Brief summary.
- **Body (optional, 72 chars per line)**: Explain what, why, and how.
- **Footer (optional)**: Issue references or breaking changes.

## Use Conventional Commits
- **Type**: Specify the change type (e.g., `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`):
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Formatting, missing semicolons, etc.
  - `refactor`: Code changes that neither fix a bug nor add a feature
  - `test`: Adding missing tests
  - `chore`: Maintenance tasks
  - `ci`: Continuous Integration changes
  - `perf`: Performance improvements
- **Scope (optional)**: Part of the codebase affected (e.g., `feat(auth)`).
- **Description**: Short summary.
- **Example**: `feat(auth): implement authentication with login form`

## Commit Often, But Not Too Often
- **Small, Logical Units**: Commit small, logical changes.
- **Avoid Noise**: Don’t commit trivial changes separately.


# Example Commit Message

```
feat(auth): implement authentication with login form

- Implemented login form with validation
- Integrated with backend authentication API
- Added unit tests for login component
```