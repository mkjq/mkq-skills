# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Feature 3: API Endpoints & R2 Download >> F3-T1-4: GET /api/books/download should return correct Content-Disposition and Cache-Control headers
- Location: tests\api.spec.ts:52:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3000
Call log:
  - → GET http://localhost:3000/api/books
    - user-agent: Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Mobile Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```