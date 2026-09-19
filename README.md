# File Upload Vulnerability Lab

This lab demonstrates the difference between a vulnerable file upload implementation and a hardened one. The project is intentionally split into two servers so you can compare dangerous behavior against secure handling in a controlled environment.

## Project Layout

- `server-vulnerable.js` — accepts uploaded files without validation
- `server-fixed.js` — blocks unsafe files and validates both extension and content
- `public/index.html` — browser-based upload form for testing both servers
- `uploads/` — storage area for uploaded files

## Start the Lab

Install dependencies:

```bash
npm install
```

Run the vulnerable app:

```bash
npm run vulnerable
```

Run the fixed app:

```bash
npm run fixed
```

Open the browser at:

- http://localhost:3002
- http://localhost:3003

## Vulnerable Behavior

The vulnerable server accepts the file name and saves it to disk without checking whether it is a valid image or a malicious script.

Example exploit payloads:

- `shell.php`
- `webshell.jsp`
- `avatar.php.jpg`
- `malicious.svg`

If the web server is configured to execute uploaded files, the attacker may be able to run server-side code or trigger a script execution flow.

## Fixed Behavior

The hardened server:

- restricts uploads to a safe file extension allowlist
- validates the MIME type
- checks the file magic number against the expected format
- rejects oversized files
- stores files with random names instead of the original filename
- prevents path traversal and direct overwrite issues

## Diff Summary

```diff
- const target = path.join(uploadDir, file.originalname);
- fs.renameSync(file.path, target);
+ const ext = path.extname(file.originalname).toLowerCase();
+ if (!allowedExtensions.has(ext)) {
+   throw new Error('Only image files are allowed');
+ }
+
+ if (!allowedMime.has(file.mimetype)) {
+   throw new Error('Invalid content type');
+ }
+
+ if (!matchesMagicNumber(file.buffer, ext)) {
+   throw new Error('File content does not match its extension');
+ }
+
+ const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
+ fs.writeFileSync(path.join(uploadDir, safeName), file.buffer);
```

This is the core difference: the vulnerable version trusts user input, while the fixed version validates both the filename and the actual file content before writing to disk.

## Preventing File Upload Vulnerabilities

### 1. Extension Validation

Do not rely only on the extension. Extensions are easy to spoof and can be used to bypass naive checks. Always apply a strict allowlist and reject dangerous extensions.

```php
$fileName = basename($_FILES["uploadFile"]["name"]);

if (preg_match('/^.*\.(php|phtml|phps|php5|jsp|jspx|asp|aspx)$/i', $fileName)) {
    echo "Only images are allowed";
    die();
}

if (!preg_match('/^.*\.(jpg|jpeg|png|gif|webp)$/i', $fileName)) {
    echo "Only images are allowed";
    die();
}
```

### 2. Content Validation

Check the file signature and MIME type. A file with a `.png` extension should begin with a valid PNG header and report a `image/png` MIME type. Never trust the client-provided content type alone.

```php
$fileName = basename($_FILES["uploadFile"]["name"]);
$contentType = $_FILES['uploadFile']['type'];
$mimeType = mime_content_type($_FILES['uploadFile']['tmp_name']);

if (!preg_match('/^.*\.png$/i', $fileName)) {
    die("Only PNG images are allowed");
}

if ($contentType !== 'image/png' || $mimeType !== 'image/png') {
    die("Only PNG images are allowed");
}
```

### 3. Hide the Uploads Directory

Do not expose the upload folder directly to users. Serve files through a controlled download endpoint instead of allowing direct access.

Recommended practices:

- store uploads outside the web root when possible
- use random names instead of raw user filenames
- keep the original file name in a database only if needed
- block direct directory listing and return `403` for the upload directory
- use `Content-Disposition`, `Content-Type`, and `X-Content-Type-Options: nosniff`

### 4. Limit Risk and Add Defenses

Use multiple layers of defense:

- limit file size
- reject unexpected content types
- scan for malware or suspicious strings
- update dependencies and server libraries
- place uploads on a separate container or server
- configure the web server to prevent executable scripts from running from the upload directory
- disable dangerous runtime functions when possible
- hide server errors from users

## Recommended Remediation Checklist

- [ ] Use a strict allowlist of permitted extensions
- [ ] Validate file content and MIME type
- [ ] Check file size and memory limits
- [ ] Rename uploaded files to random secure filenames
- [ ] Store files outside the web root or in a restricted directory
- [ ] Block direct access to the upload folder
- [ ] Implement authorization checks before serving downloads
- [ ] Scan for malware and monitor suspicious uploads
- [ ] Keep server and frameworks patched

## Why This Matters

File upload vulnerabilities remain a common way for attackers to deploy web shells, scripts, or malicious payloads. The safest approach is not one check, but a layered defense: validate the filename, validate the content, sanitize the storage path, and restrict direct access.
