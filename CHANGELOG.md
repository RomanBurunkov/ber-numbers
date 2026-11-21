# Changelog

## [0.2.0] - 22.11.2026

### Added

- Added JSDoc-based TypeScript declaration generation, run automatically before packaging.
- Added basic Github actions CI

### Fixed

- `calcLength` now rejects non-finite values such as `NaN`.

### Documentation

- Clarified `calcLength`'s purpose, supported input range, and return value.

### Packaging

- Limited published package contents to `lib` and generated declarations in `dist/types`.

### Tests

- Added coverage for negative and `NaN` inputs to `calcLength`.
