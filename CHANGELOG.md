# Changelog

## [Unreleased]

### Fixed

- `calcLength` now rejects non-finite values such as `NaN`.

### Documentation

- Clarified `calcLength`'s purpose, supported input range, and return value.

### Packaging

- Limited published package contents to `lib` via the `files` field in `package.json`.

### Tests

- Added coverage for negative and `NaN` inputs to `calcLength`.
