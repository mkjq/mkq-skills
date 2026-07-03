# Handoff Report: Milestone M2 — Books JSON Data Generation (45 Books)

## 1. Observation

### File & Codebase Structure
- **Root Directory Contents**: Listed using `list_dir` on `c:\Apps\Skills\skills-manager\`. Identified configuration files for OpenNext (`open-next.config.ts`), Wrangler (`wrangler.jsonc`), Next.js (`next.config.ts`, `package.json`), and Playwright (`playwright.config.ts`).
- **Source Directory (`src`)**: Contains `app/`, `components/`, `contexts/`, and `lib/` (specifically `cloudflare.ts`).
- **Tests Directory (`tests/`)**: Contains E2E tests:
  - `tests/library.spec.ts`
  - `tests/api.spec.ts`
  - `tests/scenarios.spec.ts`

### Specific Test Expectations (From `tests/library.spec.ts`)
- **F1-T1-2 (Grid list verification)**: Exact total of 45 books:
  ```typescript
  22:   test('F1-T1-2: Exactly 45 books are rendered in the grid layout', async ({ page }) => {
  23:     const bookCards = page.locator('[data-testid="book-card"]');
  24:     await expect(bookCards).toHaveCount(45);
  25:   });
  ```
- **F1-T1-3 (Search by title)**: Expects search for "Cloud" to match:
  ```typescript
  28:   test('F1-T1-3: Searching for "Cloud" returns only books containing "Cloud" in their title', async ({ page }) => {
  ```
- **F1-T1-4 (Search by author)**: Expects search for "Martin Fowler" to return matches:
  ```typescript
  47:     await searchInput.fill('Martin Fowler');
  ```
- **F1-T1-5 (Category filtering)**: Expects "Programming" category filter:
  ```typescript
  63:     const categoryTab = page.locator('[data-testid="category-tab"]:has-text("Programming")');
  ```
- **T3-1 (Search + Category Filter)**: Expects "Brief History of Time" to be a "History" book, and not "Technology":
  ```typescript
  11:     const technologyTab = page.locator('[data-testid="category-tab"]:has-text("Technology")');
  14:     // Search for a History book (e.g. "Brief History of Time")
  20:     // Grid should show 0 results since it is a History book, not Technology
  ```
- **T4-1 (Desktop Happy Path)**: Expects search for "Next.js":
  ```typescript
  124:     await searchInput.fill('Next.js');
  ```

### Specific Test Expectations (From `tests/api.spec.ts`)
- **F3-T1-1**: Checks that `GET /api/books` returns an array of length 45.
- **F3-T1-2 (Metadata Schema check)**: Each book object must contain the following fields:
  ```typescript
  21:       expect(book).toHaveProperty('id');
  22:       expect(book).toHaveProperty('title');
  23:       expect(book).toHaveProperty('author');
  24:       expect(book).toHaveProperty('category');
  25:       expect(book).toHaveProperty('description');
  26:       expect(book).toHaveProperty('fileKey');
  ```
- **T4-4 (Error Recovery Mock Data)**: Shows standard format expected in API responses:
  ```typescript
  247:             id: 'book-1',
  248:             title: 'Refactoring',
  249:             author: 'Martin Fowler',
  250:             category: 'Programming',
  251:             description: 'Improving the design of existing code',
  252:             fileKey: 'books/refactoring.pdf'
  ```

---

## 2. Logic Chain

1. **Schema Integrity**:
   - Every book object in the designed dataset must strictly include `id`, `title`, `author`, `category`, `description`, and `fileKey`.
   - The data types must be strings (enforced by `typeof book.xxx === 'string'`).
2. **E2E Test Alignment**:
   - The total number of items must be exactly **45**.
   - An item with `author: "Martin Fowler"`, `category: "Programming"`, and a title containing `"Refactoring"` must be included (specifically mapped to `id: "book-1"` based on `T4-4`).
   - A book titled `"A Brief History of Time"` must be in the `"History"` category so that a filter for `"Technology"` + search for `"Brief History of Time"` yields `0` results (per `T3-1`).
   - At least one book must contain `"Cloud"` in the title (per `F1-T1-3`) (e.g., `"Cloud Computing Patterns"`).
   - At least one book must contain `"Next.js"` in the title (per `T4-1`) (e.g., `"Next.js 14 Web Development"`).
   - The categories included must match the ones utilized in filters: `"Programming"`, `"Technology"`, `"History"`, `"Science"`, and `"Design"`.
3. **Storage & Format Path Choice**:
   - **`public/books.json`**:
     - *Issue*: Reading it server-side in API routes or Server Components would require Node.js `fs` file operations (e.g. `fs.readFileSync(path.join(process.cwd(), 'public/books.json'))`). Since this app compiles to **Cloudflare Workers/Pages** (as seen in `package.json` with `@opennextjs/cloudflare` and `wrangler.jsonc`), Node's `fs` filesystem APIs are unavailable at runtime, causing execution errors on Cloudflare.
   - **`src/data/books.json`**:
     - *Pros*: Can be imported using `import books from '@/data/books.json'`. This resolves at build time and compiles directly into the worker script bundle, maintaining compatibility with Cloudflare Workers.
     - *Cons*: Doesn't enforce TypeScript schema constraints on the data structure out of the box.
   - **`src/data/books.ts`**:
     - *Pros*: We can define an explicit `Book` interface and type the exported array: `export const books: Book[] = [...]`. Any missing property, wrong type, or validation error will fail at compilation time, ensuring high code quality. It is also processed during bundling and works flawlessly in the Cloudflare runtime.
   - *Conclusion*: **`src/data/books.ts`** is the recommended design choice.

---

## 3. Caveats

- **R2 File Existence**: This dataset specifies mock `fileKey` fields (e.g., `books/refactoring.pdf`). The actual PDF files in the R2 bucket must correspond to these keys for `/api/books/download?key=...` streaming to succeed.
- **Client Bundling**: Directly importing a typescript data file into a Client Component will bundle the entire data into the frontend JS bundle. In the future, if the database size grows past 45 books, it should be served strictly via `/api/books` rather than imported in frontend components directly. For the current scope (45 static books), importing on the server-side (Server Components) or API routes avoids this issue.

---

## 4. Conclusion

The books library metadata should be stored in a TypeScript file at **`src/data/books.ts`** to ensure full compile-time type-safety and seamless compilation to Cloudflare Workers via OpenNext.

Here is the recommended code layout and structures.

### Interface Definition (`src/types/book.ts` or inline in `src/data/books.ts`)
```typescript
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  fileKey: string;
}
```

### Complete Code Content for `src/data/books.ts`
```typescript
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  fileKey: string;
}

export const books: Book[] = [
  {
    id: "book-1",
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    category: "Programming",
    description: "The classic guide to revising and improving the design of existing computer code to make it more maintainable and readable.",
    fileKey: "books/refactoring.pdf"
  },
  {
    id: "book-2",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Programming",
    description: "A handbook that teaches programmers how to write clean, understandable, and robust software using practical examples.",
    fileKey: "books/clean_code.pdf"
  },
  {
    id: "book-3",
    title: "Next.js 14 Web Development",
    author: "Lee Robinson",
    category: "Programming",
    description: "Master Next.js 14 and the App Router to build highly performant, production-ready React web applications.",
    fileKey: "books/nextjs_14_web_development.pdf"
  },
  {
    id: "book-4",
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    category: "Programming",
    description: "An in-depth look at the elegant, expressive, and highly functional parts of the JavaScript language.",
    fileKey: "books/javascript_the_good_parts.pdf"
  },
  {
    id: "book-5",
    title: "The Pragmatic Programmer",
    author: "Andy Hunt & Dave Thomas",
    category: "Programming",
    description: "A collection of direct, practical advice on how to improve your coding, design, career, and productivity as a developer.",
    fileKey: "books/pragmatic_programmer.pdf"
  },
  {
    id: "book-6",
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    category: "Programming",
    description: "A modern introduction to programming, JavaScript, and web development, packed with hands-on exercises and projects.",
    fileKey: "books/eloquent_javascript.pdf"
  },
  {
    id: "book-7",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    category: "Programming",
    description: "The foundational catalog of 23 object-oriented design patterns, complete with implementation guides and examples.",
    fileKey: "books/design_patterns.pdf"
  },
  {
    id: "book-8",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    category: "Programming",
    description: "The comprehensive textbook covering the analysis, design, and implementation of a wide variety of algorithms.",
    fileKey: "books/introduction_to_algorithms.pdf"
  },
  {
    id: "book-9",
    title: "You Don't Know JS: Scope & Closures",
    author: "Kyle Simpson",
    category: "Programming",
    description: "An essential dive into the core mechanisms of JavaScript, focusing on lexical scope, closure, and lexical this.",
    fileKey: "books/you_dont_know_js_scope_closures.pdf"
  },
  {
    id: "book-10",
    title: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
    category: "Programming",
    description: "The definitive guide to learning TypeScript, covering types, advanced features, compilation, and best practices.",
    fileKey: "books/typescript_deep_dive.pdf"
  },
  {
    id: "book-11",
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson & Gerald Jay Sussman",
    category: "Programming",
    description: "A classic computer science textbook teaching modularity, abstraction, and the implementation of interpreters using Scheme.",
    fileKey: "books/sicp.pdf"
  },
  {
    id: "book-12",
    title: "Test Driven Development: By Example",
    author: "Kent Beck",
    category: "Programming",
    description: "Learn how to write clean code that works by writing automated tests first, guiding your design through concrete feedback cycles.",
    fileKey: "books/tdd_by_example.pdf"
  },
  {
    id: "book-13",
    title: "Cloud Computing Patterns",
    author: "Christoph Fehling",
    category: "Technology",
    description: "A decision guide and architectural pattern catalog for designing, building, and deploying applications to cloud environments.",
    fileKey: "books/cloud_computing_patterns.pdf"
  },
  {
    id: "book-14",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Technology",
    description: "An authoritative guide to the key concepts, algorithms, and architectures underlying reliable, scalable, and maintainable systems.",
    fileKey: "books/designing_data_intensive_applications.pdf"
  },
  {
    id: "book-15",
    title: "Site Reliability Engineering",
    author: "Niall Richard Murphy",
    category: "Technology",
    description: "How Google runs its production systems, introducing practices for managing service reliability, scaling, and automation.",
    fileKey: "books/site_reliability_engineering.pdf"
  },
  {
    id: "book-16",
    title: "Continuous Delivery",
    author: "Jez Humble & David Farley",
    category: "Technology",
    description: "A robust blueprint for automating the compilation, deployment, testing, and release of software in large-scale organizations.",
    fileKey: "books/continuous_delivery.pdf"
  },
  {
    id: "book-17",
    title: "The Mythical Man-Month",
    author: "Frederick P. Brooks Jr.",
    category: "Technology",
    description: "Influential essays on software engineering and project management, explaining why adding manpower to a late project makes it later.",
    fileKey: "books/mythical_man_month.pdf"
  },
  {
    id: "book-18",
    title: "Architecting for the Cloud",
    author: "Michael J. Kavis",
    category: "Technology",
    description: "A guide to cloud migration and cloud-native architecture, focusing on selection of service models, security, and scalability.",
    fileKey: "books/architecting_for_the_cloud.pdf"
  },
  {
    id: "book-19",
    title: "Distributed Systems: Principles and Paradigms",
    author: "Andrew S. Tanenbaum & Maarten Van Steen",
    category: "Technology",
    description: "A classic academic introduction to the design, architecture, and core challenges of distributed computer systems.",
    fileKey: "books/distributed_systems.pdf"
  },
  {
    id: "book-20",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    category: "Technology",
    description: "A comprehensive guide to networking concepts, covering physical layer, routing protocols, transport, and network security.",
    fileKey: "books/computer_networks.pdf"
  },
  {
    id: "book-21",
    title: "Kubernetes Up & Running",
    author: "Kelsey Hightower, Brendan Burns, Joe Beda",
    category: "Technology",
    description: "Learn how to build, deploy, and manage containerized applications at scale using Kubernetes orchestration.",
    fileKey: "books/kubernetes_up_and_running.pdf"
  },
  {
    id: "book-22",
    title: "The Phoenix Project",
    author: "Gene Kim, Kevin Behr, George Spafford",
    category: "Technology",
    description: "A novel about IT, DevOps, and helping your business win, demonstrating how to align development and operations.",
    fileKey: "books/phoenix_project.pdf"
  },
  {
    id: "book-23",
    title: "Accelerate: The Science of Lean Software and DevOps",
    author: "Nicole Forsgren, Jez Humble, Gene Kim",
    category: "Technology",
    description: "A data-driven study showing how DevOps capabilities and software delivery performance drive organizational performance.",
    fileKey: "books/accelerate.pdf"
  },
  {
    id: "book-24",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    category: "History",
    description: "A landmark book by the legendary physicist, exploring the origins, nature, structure, and ultimate fate of the universe.",
    fileKey: "books/brief_history_of_time.pdf"
  },
  {
    id: "book-25",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    description: "An exploration of how Homo sapiens came to dominate the Earth, tracing history from the cognitive revolution to the modern age.",
    fileKey: "books/sapiens.pdf"
  },
  {
    id: "book-26",
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    category: "History",
    description: "An examination of how environmental and geographical factors shaped the fates of different human civilizations.",
    fileKey: "books/guns_germs_and_steel.pdf"
  },
  {
    id: "book-27",
    title: "The Silk Roads: A New History of the World",
    author: "Peter Frankopan",
    category: "History",
    description: "A major reassessment of world history, focusing on the historical trade networks and routes connecting East and West.",
    fileKey: "books/silk_roads.pdf"
  },
  {
    id: "book-28",
    title: "The Rise and Fall of the Third Reich",
    author: "William L. Shirer",
    category: "History",
    description: "A definitive, detailed historical account of the Nazi regime from its origins to the end of World War II in Europe.",
    fileKey: "books/rise_and_fall_of_third_reich.pdf"
  },
  {
    id: "book-29",
    title: "1776",
    author: "David McCullough",
    category: "History",
    description: "The dramatic story of the American forces and British forces during the pivotal year of the American Revolutionary War.",
    fileKey: "books/1776.pdf"
  },
  {
    id: "book-30",
    title: "SPQR: A History of Ancient Rome",
    author: "Mary Beard",
    category: "History",
    description: "A masterful and comprehensive exploration of the rise, success, governance, and daily life of the Roman Empire.",
    fileKey: "books/spqr.pdf"
  },
  {
    id: "book-31",
    title: "The Guns of August",
    author: "Barbara W. Tuchman",
    category: "History",
    description: "A classic, Pulitzer Prize-winning history of the outbreak, diplomatic maneuvers, and opening month of World War I.",
    fileKey: "books/guns_of_august.pdf"
  },
  {
    id: "book-32",
    title: "Cosmos",
    author: "Carl Sagan",
    category: "Science",
    description: "A beautifully written and accessible journey through space, time, human history, and scientific discovery.",
    fileKey: "books/cosmos.pdf"
  },
  {
    id: "book-33",
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    category: "Science",
    description: "A landmark work in evolutionary biology, introducing the gene-centric view of evolution and coining the word 'meme'.",
    fileKey: "books/selfish_gene.pdf"
  },
  {
    id: "book-34",
    title: "The Elegant Universe",
    author: "Brian Greene",
    category: "Science",
    description: "An introduction to superstring theory, hidden dimensions, and the quest for the ultimate theory of everything.",
    fileKey: "books/elegant_universe.pdf"
  },
  {
    id: "book-35",
    title: "Astrophysics for People in a Hurry",
    author: "Neil deGrasse Tyson",
    category: "Science",
    description: "A quick, witty, and illuminating guide to the essential physics governing the cosmos, from the Big Bang to black holes.",
    fileKey: "books/astrophysics_for_people_in_a_hurry.pdf"
  },
  {
    id: "book-36",
    title: "The Emperor of All Maladies",
    author: "Siddhartha Mukherjee",
    category: "Science",
    description: "A biography of cancer, charting its history, treatments, scientific breakthroughs, and the human cost of the disease.",
    fileKey: "books/emperor_of_all_maladies.pdf"
  },
  {
    id: "book-37",
    title: "Gödel, Escher, Bach: An Eternal Golden Braid",
    author: "Douglas R. Hofstadter",
    category: "Science",
    description: "A Pulitzer Prize-winning exploration of logic, art, music, mathematics, and cognitive science, examining how self-reference works.",
    fileKey: "books/godel_escher_bach.pdf"
  },
  {
    id: "book-38",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Science",
    description: "An analysis of the two cognitive systems that drive our decisions: the fast, intuitive system and the slow, logical system.",
    fileKey: "books/thinking_fast_and_slow.pdf"
  },
  {
    id: "book-39",
    title: "The Gene: An Intimate History",
    author: "Siddhartha Mukherjee",
    category: "Science",
    description: "A sweeping and personal history of the gene, tracing the discovery of genetics and the ethical questions of modern gene-editing.",
    fileKey: "books/the_gene.pdf"
  },
  {
    id: "book-40",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    category: "Design",
    description: "A foundational text on usability and design, showing how simple design changes can make products intuitive rather than frustrating.",
    fileKey: "books/design_of_everyday_things.pdf"
  },
  {
    id: "book-41",
    title: "Don't Make Me Think: A Common Sense Approach to Web Usability",
    author: "Steve Krug",
    category: "Design",
    description: "A witty, practical, and highly accessible guide to web usability principles and interface layout best practices.",
    fileKey: "books/dont_make_me_think.pdf"
  },
  {
    id: "book-42",
    title: "Refactoring UI",
    author: "Adam Wathan & Steve Schoger",
    category: "Design",
    description: "A practical guide to designing beautiful user interfaces yourself using tactical, developer-focused design principles.",
    fileKey: "books/refactoring_ui.pdf"
  },
  {
    id: "book-43",
    title: "About Face: The Essentials of Interaction Design",
    author: "Alan Cooper, Robert Reimann, David Cronin, Christopher Noessel",
    category: "Design",
    description: "The definitive guide to designing effective, user-centered digital products and web interfaces.",
    fileKey: "books/about_face.pdf"
  },
  {
    id: "book-44",
    title: "Grid Systems in Graphic Design",
    author: "Josef Müller-Brockmann",
    category: "Design",
    description: "A classic visual manual detailing the use of grid systems in layout design, typography, and exhibition space.",
    fileKey: "books/grid_systems.pdf"
  },
  {
    id: "book-45",
    title: "Thinking with Type",
    author: "Ellen Lupton",
    category: "Design",
    description: "A critical guide to using letters, words, and paragraphs in visual communication, explaining how type is structured and arranged.",
    fileKey: "books/thinking_with_type.pdf"
  }
];
```

### Complete JSON Version (`src/data/books.json`)
If the development team prefers raw JSON over a TS module, the exact equivalent JSON is:
```json
[
  {
    "id": "book-1",
    "title": "Refactoring: Improving the Design of Existing Code",
    "author": "Martin Fowler",
    "category": "Programming",
    "description": "The classic guide to revising and improving the design of existing computer code to make it more maintainable and readable.",
    "fileKey": "books/refactoring.pdf"
  },
  {
    "id": "book-2",
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "author": "Robert C. Martin",
    "category": "Programming",
    "description": "A handbook that teaches programmers how to write clean, understandable, and robust software using practical examples.",
    "fileKey": "books/clean_code.pdf"
  },
  {
    "id": "book-3",
    "title": "Next.js 14 Web Development",
    "author": "Lee Robinson",
    "category": "Programming",
    "description": "Master Next.js 14 and the App Router to build highly performant, production-ready React web applications.",
    "fileKey": "books/nextjs_14_web_development.pdf"
  },
  {
    "id": "book-4",
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "category": "Programming",
    "description": "An in-depth look at the elegant, expressive, and highly functional parts of the JavaScript language.",
    "fileKey": "books/javascript_the_good_parts.pdf"
  },
  {
    "id": "book-5",
    "title": "The Pragmatic Programmer",
    "author": "Andy Hunt & Dave Thomas",
    "category": "Programming",
    "description": "A collection of direct, practical advice on how to improve your coding, design, career, and productivity as a developer.",
    "fileKey": "books/pragmatic_programmer.pdf"
  },
  {
    "id": "book-6",
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "category": "Programming",
    "description": "A modern introduction to programming, JavaScript, and web development, packed with hands-on exercises and projects.",
    "fileKey": "books/eloquent_javascript.pdf"
  },
  {
    "id": "book-7",
    "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
    "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    "category": "Programming",
    "description": "The foundational catalog of 23 object-oriented design patterns, complete with implementation guides and examples.",
    "fileKey": "books/design_patterns.pdf"
  },
  {
    "id": "book-8",
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    "category": "Programming",
    "description": "The comprehensive textbook covering the analysis, design, and implementation of a wide variety of algorithms.",
    "fileKey": "books/introduction_to_algorithms.pdf"
  },
  {
    "id": "book-9",
    "title": "You Don't Know JS: Scope & Closures",
    "author": "Kyle Simpson",
    "category": "Programming",
    "description": "An essential dive into the core mechanisms of JavaScript, focusing on lexical scope, closure, and lexical this.",
    "fileKey": "books/you_dont_know_js_scope_closures.pdf"
  },
  {
    "id": "book-10",
    "title": "TypeScript Deep Dive",
    "author": "Basarat Ali Syed",
    "category": "Programming",
    "description": "The definitive guide to learning TypeScript, covering types, advanced features, compilation, and best practices.",
    "fileKey": "books/typescript_deep_dive.pdf"
  },
  {
    "id": "book-11",
    "title": "Structure and Interpretation of Computer Programs",
    "author": "Harold Abelson & Gerald Jay Sussman",
    "category": "Programming",
    "description": "A classic computer science textbook teaching modularity, abstraction, and the implementation of interpreters using Scheme.",
    "fileKey": "books/sicp.pdf"
  },
  {
    "id": "book-12",
    "title": "Test Driven Development: By Example",
    "author": "Kent Beck",
    "category": "Programming",
    "description": "Learn how to write clean code that works by writing automated tests first, guiding your design through concrete feedback cycles.",
    "fileKey": "books/tdd_by_example.pdf"
  },
  {
    "id": "book-13",
    "title": "Cloud Computing Patterns",
    "author": "Christoph Fehling",
    "category": "Technology",
    "description": "A decision guide and architectural pattern catalog for designing, building, and deploying applications to cloud environments.",
    "fileKey": "books/cloud_computing_patterns.pdf"
  },
  {
    "id": "book-14",
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "category": "Technology",
    "description": "An authoritative guide to the key concepts, algorithms, and architectures underlying reliable, scalable, and maintainable systems.",
    "fileKey": "books/designing_data_intensive_applications.pdf"
  },
  {
    "id": "book-15",
    "title": "Site Reliability Engineering",
    "author": "Niall Richard Murphy",
    "category": "Technology",
    "description": "How Google runs its production systems, introducing practices for managing service reliability, scaling, and automation.",
    "fileKey": "books/site_reliability_engineering.pdf"
  },
  {
    "id": "book-16",
    "title": "Continuous Delivery",
    "author": "Jez Humble & David Farley",
    "category": "Technology",
    "description": "A robust blueprint for automating the compilation, deployment, testing, and release of software in large-scale organizations.",
    "fileKey": "books/continuous_delivery.pdf"
  },
  {
    "id": "book-17",
    "title": "The Mythical Man-Month",
    "author": "Frederick P. Brooks Jr.",
    "category": "Technology",
    "description": "Influential essays on software engineering and project management, explaining why adding manpower to a late project makes it later.",
    "fileKey": "books/mythical_man_month.pdf"
  },
  {
    "id": "book-18",
    "title": "Architecting for the Cloud",
    "author": "Michael J. Kavis",
    "category": "Technology",
    "description": "A guide to cloud migration and cloud-native architecture, focusing on selection of service models, security, and scalability.",
    "fileKey": "books/architecting_for_the_cloud.pdf"
  },
  {
    "id": "book-19",
    "title": "Distributed Systems: Principles and Paradigms",
    "author": "Andrew S. Tanenbaum & Maarten Van Steen",
    "category": "Technology",
    "description": "A classic academic introduction to the design, architecture, and core challenges of distributed computer systems.",
    "fileKey": "books/distributed_systems.pdf"
  },
  {
    "id": "book-20",
    "title": "Computer Networks",
    "author": "Andrew S. Tanenbaum",
    "category": "Technology",
    "description": "A comprehensive guide to networking concepts, covering physical layer, routing protocols, transport, and network security.",
    "fileKey": "books/computer_networks.pdf"
  },
  {
    "id": "book-21",
    "title": "Kubernetes Up & Running",
    "author": "Kelsey Hightower, Brendan Burns, Joe Beda",
    "category": "Technology",
    "description": "Learn how to build, deploy, and manage containerized applications at scale using Kubernetes orchestration.",
    "fileKey": "books/kubernetes_up_and_running.pdf"
  },
  {
    "id": "book-22",
    "title": "The Phoenix Project",
    "author": "Gene Kim, Kevin Behr, George Spafford",
    "category": "Technology",
    "description": "A novel about IT, DevOps, and helping your business win, demonstrating how to align development and operations.",
    "fileKey": "books/phoenix_project.pdf"
  },
  {
    "id": "book-23",
    "title": "Accelerate: The Science of Lean Software and DevOps",
    "author": "Nicole Forsgren, Jez Humble, Gene Kim",
    "category": "Technology",
    "description": "A data-driven study showing how DevOps capabilities and software delivery performance drive organizational performance.",
    "fileKey": "books/accelerate.pdf"
  },
  {
    "id": "book-24",
    "title": "A Brief History of Time",
    "author": "Stephen Hawking",
    "category": "History",
    "description": "A landmark book by the legendary physicist, exploring the origins, nature, structure, and ultimate fate of the universe.",
    "fileKey": "books/brief_history_of_time.pdf"
  },
  {
    "id": "book-25",
    "title": "Sapiens: A Brief History of Humankind",
    "author": "Yuval Noah Harari",
    "category": "History",
    "description": "An exploration of how Homo sapiens came to dominate the Earth, tracing history from the cognitive revolution to the modern age.",
    "fileKey": "books/sapiens.pdf"
  },
  {
    "id": "book-26",
    "title": "Guns, Germs, and Steel",
    "author": "Jared Diamond",
    "category": "History",
    "description": "An examination of how environmental and geographical factors shaped the fates of different human civilizations.",
    "fileKey": "books/guns_germs_and_steel.pdf"
  },
  {
    "id": "book-27",
    "title": "The Silk Roads: A New History of the World",
    "author": "Peter Frankopan",
    "category": "History",
    "description": "A major reassessment of world history, focusing on the historical trade networks and routes connecting East and West.",
    "fileKey": "books/silk_roads.pdf"
  },
  {
    "id": "book-28",
    "title": "The Rise and Fall of the Third Reich",
    "author": "William L. Shirer",
    "category": "History",
    "description": "A definitive, detailed historical account of the Nazi regime from its origins to the end of World War II in Europe.",
    "fileKey": "books/rise_and_fall_of_third_reich.pdf"
  },
  {
    "id": "book-29",
    "title": "1776",
    "author": "David McCullough",
    "category": "History",
    "description": "The dramatic story of the American forces and British forces during the pivotal year of the American Revolutionary War.",
    "fileKey": "books/1776.pdf"
  },
  {
    "id": "book-30",
    "title": "SPQR: A History of Ancient Rome",
    "author": "Mary Beard",
    "category": "History",
    "description": "A masterful and comprehensive exploration of the rise, success, governance, and daily life of the Roman Empire.",
    "fileKey": "books/spqr.pdf"
  },
  {
    "id": "book-31",
    "title": "The Guns of August",
    "author": "Barbara W. Tuchman",
    "category": "History",
    "description": "A classic, Pulitzer Prize-winning history of the outbreak, diplomatic maneuvers, and opening month of World War I.",
    "fileKey": "books/guns_of_august.pdf"
  },
  {
    "id": "book-32",
    "title": "Cosmos",
    "author": "Carl Sagan",
    "category": "Science",
    "description": "A beautifully written and accessible journey through space, time, human history, and scientific discovery.",
    "fileKey": "books/cosmos.pdf"
  },
  {
    "id": "book-33",
    "title": "The Selfish Gene",
    "author": "Richard Dawkins",
    "category": "Science",
    "description": "A landmark work in evolutionary biology, introducing the gene-centric view of evolution and coining the word 'meme'.",
    "fileKey": "books/selfish_gene.pdf"
  },
  {
    "id": "book-34",
    "title": "The Elegant Universe",
    "author": "Brian Greene",
    "category": "Science",
    "description": "An introduction to superstring theory, hidden dimensions, and the quest for the ultimate theory of everything.",
    "fileKey": "books/elegant_universe.pdf"
  },
  {
    "id": "book-35",
    "title": "Astrophysics for People in a Hurry",
    "author": "Neil deGrasse Tyson",
    "category": "Science",
    "description": "A quick, witty, and illuminating guide to the essential physics governing the cosmos, from the Big Bang to black holes.",
    "fileKey": "books/astrophysics_for_people_in_a_hurry.pdf"
  },
  {
    "id": "book-36",
    "title": "The Emperor of All Maladies",
    "author": "Siddhartha Mukherjee",
    "category": "Science",
    "description": "A biography of cancer, charting its history, treatments, scientific breakthroughs, and the human cost of the disease.",
    "fileKey": "books/emperor_of_all_maladies.pdf"
  },
  {
    "id": "book-37",
    "title": "Gödel, Escher, Bach: An Eternal Golden Braid",
    "author": "Douglas R. Hofstadter",
    "category": "Science",
    "description": "A Pulitzer Prize-winning exploration of logic, art, music, mathematics, and cognitive science, examining how self-reference works.",
    "fileKey": "books/godel_escher_bach.pdf"
  },
  {
    "id": "book-38",
    "title": "Thinking, Fast and Slow",
    "author": "Daniel Kahneman",
    "category": "Science",
    "description": "An analysis of the two cognitive systems that drive our decisions: the fast, intuitive system and the slow, logical system.",
    "fileKey": "books/thinking_fast_and_slow.pdf"
  },
  {
    "id": "book-39",
    "title": "The Gene: An Intimate History",
    "author": "Siddhartha Mukherjee",
    "category": "Science",
    "description": "A sweeping and personal history of the gene, tracing the discovery of genetics and the ethical questions of modern gene-editing.",
    "fileKey": "books/the_gene.pdf"
  },
  {
    "id": "book-40",
    "title": "The Design of Everyday Things",
    "author": "Don Norman",
    "category": "Design",
    "description": "A foundational text on usability and design, showing how simple design changes can make products intuitive rather than frustrating.",
    "fileKey": "books/design_of_everyday_things.pdf"
  },
  {
    "id": "book-41",
    "title": "Don't Make Me Think: A Common Sense Approach to Web Usability",
    "author": "Steve Krug",
    "category": "Design",
    "description": "A witty, practical, and highly accessible guide to web usability principles and interface layout best practices.",
    "fileKey": "books/dont_make_me_think.pdf"
  },
  {
    "id": "book-42",
    "title": "Refactoring UI",
    "author": "Adam Wathan & Steve Schoger",
    "category": "Design",
    "description": "A practical guide to designing beautiful user interfaces yourself using tactical, developer-focused design principles.",
    "fileKey": "books/refactoring_ui.pdf"
  },
  {
    "id": "book-43",
    "title": "About Face: The Essentials of Interaction Design",
    "author": "Alan Cooper, Robert Reimann, David Cronin, Christopher Noessel",
    "category": "Design",
    "description": "The definitive guide to designing effective, user-centered digital products and web interfaces.",
    "fileKey": "books/about_face.pdf"
  },
  {
    "id": "book-44",
    "title": "Grid Systems in Graphic Design",
    "author": "Josef Müller-Brockmann",
    "category": "Design",
    "description": "A classic visual manual detailing the use of grid systems in layout design, typography, and exhibition space.",
    "fileKey": "books/grid_systems.pdf"
  },
  {
    "id": "book-45",
    "title": "Thinking with Type",
    "author": "Ellen Lupton",
    "category": "Design",
    "description": "A critical guide to using letters, words, and paragraphs in visual communication, explaining how type is structured and arranged.",
    "fileKey": "books/thinking_with_type.pdf"
  }
]
```

---

## 5. Verification Method

To independently verify the validity and integration readiness of this dataset:

1. **Schema Check via TypeScript Compilation**:
   Save the TS code blocks as `src/data/books.ts` and run a typecheck:
   ```bash
   npm run build
   # or
   npx tsc --noEmit
   ```
   If the compilation succeeds without errors, the schema is valid and perfectly typed.

2. **Integration Verification via E2E Tests**:
   After the implementer creates the `/api/books` API endpoint and imports this dataset, the full test suite can be run:
   ```bash
   npx playwright test
   ```
   Specific tests to monitor:
   - `tests/api.spec.ts` (API schema validations and endpoint checks)
   - `tests/library.spec.ts` (UI grid counts, searches, category filters)
   - `tests/scenarios.spec.ts` (Dynamic interactions and reset triggers)

3. **Invalidation Conditions**:
   The verification fails if:
   - The array contains a number of items other than exactly `45`.
   - The book titled `"A Brief History of Time"` is not under the `"History"` category.
   - The book titled `"Refactoring: Improving the Design of Existing Code"` is not authored by `"Martin Fowler"` or does not have `id: "book-1"`.
   - The dataset contains categories other than `"Programming"`, `"Technology"`, `"History"`, `"Science"`, and `"Design"`.
   - Any property like `id`, `title`, `author`, `category`, `description`, or `fileKey` is missing or is not a string.
