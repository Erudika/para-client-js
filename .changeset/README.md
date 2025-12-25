# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) to track user-visible changes and automate npm releases.

1. Run `npx changeset` to create a new entry whenever you make a change that should be published. Pick the appropriate semver bump when prompted.
2. Commit the generated markdown file under `.changeset/`.
3. When you're ready to release, run `npx changeset version && npm install` to apply the version bumps, then either execute `./deploy.sh` (manual workflow) or `npm run release` (Changesets automation) to publish.

The CI workflow will fail if there are pending changesets without a matching release.
