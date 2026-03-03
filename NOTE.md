# TODO:

## Critical

- [ ] Generate `.env.example` with all the environment variables without the values. So other developers can copy it and fill it with their own values.
- [X] Must create custom hook for security logic and make it separated from the main component. (Need to be check)

## Non-Critical

- [X] Improve UX on practice buttons:
    - [X] Add hover color differentiation (e.g., `hover:bg-muted` or `hover:opacity-80`)
    - [X] Change cursor to pointer (`cursor-pointer`)
- [ ] Add loading state when submitting answers (e.g., using `useState` or `useFormStatus`)
- [X] Should seperate components into different files and folders to make it more maintainable. (Only some components are separated)
- [ ] Should implement `i18n` for the UI texts (https://nextjs.org/docs/pages/guides/internationalization). At this time, I (Ray) only separated the texts into different files at `i18n` folder.
- [ ] Should implement path alias for the imports to make it more maintainable.

