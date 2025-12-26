# Security

## VoiceWatch AI Security Overview

VoiceWatch AI takes the security of user credentials and sensitive data seriously. This document outlines our security practices and encryption implementation.

## Credential Encryption

### AES-256-GCM Encryption
All API credentials are encrypted using industry-standard **AES-256-GCM** (Galois/Counter Mode) encryption before being stored locally in the browser. This provides both confidentiality and authenticity of the encrypted data.

### Key Features
- **256-bit encryption keys** generated using the Web Crypto API
- **Unique initialization vectors (IV)** for each encryption operation
- **Local storage only** - credentials never leave the user's device
- **Automatic key generation** - encryption keys are generated per browser session
- **Password-based encryption** for backup exports using PBKDF2 with 100,000 iterations

### Implementation Details

#### Browser Storage Encryption
```typescript
// Credentials are encrypted before storage
const encrypted = await encryptData(JSON.stringify(credentials))
localStorage.setItem('secure_api-config', encrypted)
```

#### Backup/Export Encryption
```typescript
// Backups use password-based encryption with salt
const encrypted = await encryptWithPassword(data, userPassword)
// File includes: [SALT(16 bytes)][IV(12 bytes)][ENCRYPTED_DATA]
```

### Security Best Practices Implemented

1. **No Server Transmission**: API keys are stored and encrypted locally. They are only transmitted to their respective service providers when making authorized API calls.

2. **Automatic Key Management**: Encryption keys are automatically generated and managed by the browser's secure crypto API.

3. **Masked Display**: API keys are displayed in masked format (e.g., `********xyz123`) in the UI.

4. **Secure Deletion**: When credentials are cleared, they are removed from all storage locations.

5. **Validation**: API keys are validated before being accepted to ensure proper format.

### Browser Compatibility

The encryption system requires:
- Modern browser with Web Crypto API support (Chrome 37+, Firefox 34+, Safari 11+, Edge 79+)
- LocalStorage enabled
- JavaScript enabled

### Data Security Warnings

⚠️ **Important**: 
- Clearing browser data will delete all stored encrypted credentials
- Users should maintain secure backups of their API keys
- Password-protected backups should use strong, unique passwords
- The encryption is only as secure as the device it runs on

## Attack Surface

### What We Protect Against
- ✅ Plain-text credential storage
- ✅ Unauthorized local access to stored credentials
- ✅ Credential exposure in browser dev tools
- ✅ Accidental credential commits to repositories

### What Users Should Protect Against
- ⚠️ Malware on the user's device
- ⚠️ Physical access to unlocked devices
- ⚠️ Browser extensions with malicious intent
- ⚠️ Compromised browser environments

## Responsible Disclosure

Thanks for helping make GitHub safe for everyone.

GitHub takes the security of our software products and services seriously, including all of the open source code repositories managed through our GitHub organizations, such as [GitHub](https://github.com/GitHub).

Even though [open source repositories are outside of the scope of our bug bounty program](https://bounty.github.com/index.html#scope) and therefore not eligible for bounty rewards, we will ensure that your finding gets passed along to the appropriate maintainers for remediation. 

## Reporting Security Issues

If you believe you have found a security vulnerability in any GitHub-owned repository, please report it to us through coordinated disclosure.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please send an email to opensource-security[@]github.com.

Please include as much of the information listed below as you can to help us better understand and resolve the issue:

  * The type of issue (e.g., buffer overflow, SQL injection, or cross-site scripting)
  * Full paths of source file(s) related to the manifestation of the issue
  * The location of the affected source code (tag/branch/commit or direct URL)
  * Any special configuration required to reproduce the issue
  * Step-by-step instructions to reproduce the issue
  * Proof-of-concept or exploit code (if possible)
  * Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Policy

See [GitHub's Safe Harbor Policy](https://docs.github.com/en/site-policy/security-policies/github-bug-bounty-program-legal-safe-harbor#1-safe-harbor-terms)
