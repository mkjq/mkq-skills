const fs = require('fs');

async function testGutenberg() {
  const url = 'https://gutendex.com/books/?languages=ar';
  const response = await fetch(url);
  const data = await response.json();
  console.log(JSON.stringify(data.results.slice(0, 5).map(b => ({
    title: b.title,
    authors: b.authors.map(a => a.name).join(', '),
    pdf: b.formats['application/pdf'],
    epub: b.formats['application/epub+zip'],
    image: b.formats['image/jpeg']
  })), null, 2));
}

testGutenberg().catch(console.error);
