const path = require('path');
const fs = require('fs');

// Load the compiled books.js
const booksFilePath = path.join(__dirname, 'temp', 'books.js');

function runVerification() {
  console.log('--- STARTING PROGRAMMATIC DATASET VERIFICATION ---');
  
  if (!fs.existsSync(booksFilePath)) {
    console.error(`Error: Compiled books.js not found at ${booksFilePath}`);
    process.exit(1);
  }
  
  const dataset = require(booksFilePath);
  
  // 1. Verify export of books array
  if (!dataset.books) {
    console.error('FAIL: Dataset does not export a "books" array');
    process.exit(1);
  }
  
  const books = dataset.books;
  if (!Array.isArray(books)) {
    console.error('FAIL: exported "books" is not an array');
    process.exit(1);
  }
  
  console.log(`PASS: Exported "books" is a valid array of length ${books.length}`);
  
  // 2. Length of books array is exactly 45
  if (books.length !== 45) {
    console.error(`FAIL: Array length is ${books.length}, expected exactly 45`);
  } else {
    console.log('PASS: Array length is exactly 45');
  }
  
  // 3. Schema correctness for all items
  let schemaErrors = 0;
  const ids = new Set();
  const titles = new Set();
  const fileKeys = new Set();
  const categories = new Set();
  
  books.forEach((book, idx) => {
    const itemNum = idx + 1;
    const requiredKeys = ['id', 'title', 'author', 'category', 'description', 'fileKey'];
    requiredKeys.forEach(k => {
      if (book[k] === undefined || book[k] === null || typeof book[k] !== 'string' || book[k].trim() === '') {
        console.error(`FAIL: Item ${itemNum} is missing or has invalid string value for key "${k}":`, book);
        schemaErrors++;
      }
    });
    
    if (book.id) {
      if (ids.has(book.id)) {
        console.error(`FAIL: Duplicate ID found: "${book.id}" at index ${idx}`);
        schemaErrors++;
      }
      ids.add(book.id);
    }
    
    if (book.title) {
      if (titles.has(book.title.toLowerCase())) {
        console.warn(`WARNING: Duplicate title (case-insensitive) found: "${book.title}"`);
      }
      titles.add(book.title.toLowerCase());
    }
    
    if (book.fileKey) {
      if (fileKeys.has(book.fileKey)) {
        console.error(`FAIL: Duplicate fileKey found: "${book.fileKey}" at index ${idx}`);
        schemaErrors++;
      }
      fileKeys.add(book.fileKey);
      
      // Check fileKey format: must start with books/ and end with .pdf
      if (!book.fileKey.startsWith('books/') || !book.fileKey.endsWith('.pdf')) {
        console.error(`FAIL: Invalid fileKey pattern: "${book.fileKey}". Must be "books/*.pdf"`);
        schemaErrors++;
      }
    }
    
    if (book.category) {
      categories.add(book.category);
    }
  });
  
  if (schemaErrors === 0) {
    console.log('PASS: All 45 items conform to the Book schema (id, title, author, category, description, fileKey)');
    console.log('PASS: No duplicate IDs or duplicate fileKeys found.');
  } else {
    console.error(`FAIL: Found ${schemaErrors} schema/integrity errors in books array.`);
  }
  
  // 4. Categories coverage: Programming, Technology, Science, History, and Design
  const requiredCategories = ['Programming', 'Technology', 'Science', 'History', 'Design'];
  console.log('Observed categories:', Array.from(categories));
  
  requiredCategories.forEach(cat => {
    if (!categories.has(cat)) {
      console.error(`FAIL: Missing required category "${cat}"`);
    } else {
      const count = books.filter(b => b.category === cat).length;
      console.log(`PASS: Category "${cat}" is present with ${count} books.`);
    }
  });
  
  // 5. Author "Martin Fowler" exists
  const fowlerBooks = books.filter(b => b.author === 'Martin Fowler');
  if (fowlerBooks.length === 0) {
    console.error('FAIL: No books by author "Martin Fowler"');
  } else {
    console.log(`PASS: Found ${fowlerBooks.length} book(s) by Martin Fowler:`);
    fowlerBooks.forEach(b => console.log(`   - "${b.title}"`));
  }
  
  // 6. Title containing "Cloud" exists
  const cloudBooks = books.filter(b => b.title.includes('Cloud'));
  if (cloudBooks.length === 0) {
    console.error('FAIL: No books containing "Cloud" in their title');
  } else {
    console.log(`PASS: Found ${cloudBooks.length} book(s) containing "Cloud" in their title:`);
    cloudBooks.forEach(b => console.log(`   - "${b.title}"`));
  }
  
  // 7. Title containing "Next.js" exists
  const nextjsBooks = books.filter(b => b.title.includes('Next.js'));
  if (nextjsBooks.length === 0) {
    console.error('FAIL: No books containing "Next.js" in their title');
  } else {
    console.log(`PASS: Found ${nextjsBooks.length} book(s) containing "Next.js" in their title:`);
    nextjsBooks.forEach(b => console.log(`   - "${b.title}"`));
  }
  
  // 8. Book "Brief History of Time" exists in "History" category
  const briefHistoryBooks = books.filter(b => b.title === 'Brief History of Time');
  if (briefHistoryBooks.length === 0) {
    console.error('FAIL: Book "Brief History of Time" not found');
  } else {
    briefHistoryBooks.forEach(b => {
      if (b.category !== 'History') {
        console.error(`FAIL: Book "Brief History of Time" exists but is under category "${b.category}", expected "History"`);
      } else {
        console.log('PASS: Book "Brief History of Time" exists and is classified under "History" category.');
      }
    });
  }
  
  console.log('--- VERIFICATION COMPLETED ---');
}

runVerification();
