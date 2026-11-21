# Changelog

## [Unreleased]

### Added

- Added JSDoc-based TypeScript declaration generation, run automatically before packaging.

### Fixed

- `calcLength` now rejects non-finite values such as `NaN`.

### Documentation

- Clarified `calcLength`'s purpose, supported input range, and return value.

### Packaging

- Limited published package contents to `lib` and generated declarations in `dist/types`.

### Tests

- Added coverage for negative and `NaN` inputs to `calcLength`.
