/**
 * @fileoverview
 * ServeIQ is a JavaScript (not TypeScript) React project, so this folder
 * holds shared JSDoc typedefs instead of .ts interfaces — editors like
 * VS Code still get autocomplete and inline docs from these via JSDoc's
 * `@typedef` + `@param {SomeType}` comments in the files that use them.
 *
 * Add new shared shapes here as each module's API is wired up
 * (Phase 2+). Keeping this file present now — even though it's a stub —
 * establishes the pattern from Phase 1 onward instead of introducing
 * it ad hoc later.
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {number|null} branch_id
 * @property {string[]} permissions
 */

/**
 * @typedef {Object} ApiError
 * @property {number} status
 * @property {string} message
 */

export {};
