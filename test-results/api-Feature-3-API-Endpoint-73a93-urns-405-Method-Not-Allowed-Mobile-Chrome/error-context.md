# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Feature 3: API Endpoints & R2 Download >> F3-T2-4: POST or PUT to /api/books returns 405 Method Not Allowed
- Location: tests\api.spec.ts:118:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/books
    - user-agent: Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Mobile Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```