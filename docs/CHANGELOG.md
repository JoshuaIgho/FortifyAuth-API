# FortifyAuth Changelog

This document logs significant security, performance, and functional updates to the FortifyAuth platform.

---

## [1.4.2] - 2026-06-20
### Added
* Built-in multi-AZ VPC deployment documentation.
* Integration guides for Redis Cluster session caches.
* Support for Swagger OpenAPI endpoint routing schemas throughout the application codebases.

### Changed
* Adjusted bcrypt salt iteration factor to 12.
* Fortified cookie delivery parameters by enforcing strict CORS domain matching pipelines.

### Fixed
* Corrected edge case in sliding-window rate limit checks where overlapping microsecond request timings caused Redis errors at scale.

---

## [1.3.1] - 2026-04-12
### Added
* Basic TOTP MFA support.
* Single-use rotation controls for JWT refresh token loops.

### Patched
* Fixed token-hijack regression by forcing absolute destruction of cookie parameters during GET requests on Logout endpoints.
