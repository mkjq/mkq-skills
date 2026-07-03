const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const BUCKET = process.env.R2_BUCKET || 'mkq-skills';
const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const arabicBooksData = [
  // الفلسفة والفكر (Philosophy)
  { id: 'muqaddimah', title: 'مقدمة ابن خلدون', author: 'ابن خلدون', category: 'Philosophy', description: 'من أهم الكتب العربية في علم الاجتماع والتاريخ.' },
  { id: 'the-prophet', title: 'النبي', author: 'جبران خليل جبران', category: 'Philosophy', description: 'كتاب فلسفي وروحي يتناول قضايا الحياة والموت والحب.' },
  { id: 'taha-hussein-ayam', title: 'الأيام', author: 'طه حسين', category: 'Philosophy', description: 'سيرة ذاتية لعميد الأدب العربي طه حسين تعكس الحياة في مصر.' },
  { id: 'al-islam-wa-osoloho', title: 'الإسلام وأصول الحكم', author: 'علي عبد الرازق', category: 'Philosophy', description: 'كتاب يناقش الخلافة والحكم في التاريخ الإسلامي.' },
  { id: 'hayy-ibn-yaqdhan', title: 'حي بن يقظان', author: 'ابن طفيل', category: 'Philosophy', description: 'قصة فلسفية تلخص الفكر الفلسفي الأندلسي.' },
  { id: 'tahafut-al-falasifa', title: 'تهافت الفلاسفة', author: 'أبو حامد الغزالي', category: 'Philosophy', description: 'نقد عميق للفلسفة اليونانية والمنطق من منظور إسلامي.' },
  { id: 'al-munqidh', title: 'المنقذ من الضلال', author: 'أبو حامد الغزالي', category: 'Philosophy', description: 'سيرة ذاتية فكرية ورحلة نحو اليقين.' },
  { id: 'risalat-al-ghufran', title: 'رسالة الغفران', author: 'أبو العلاء المعري', category: 'Philosophy', description: 'رحلة خيالية فلسفية في الدار الآخرة.' },
  { id: 'al-bukhala', title: 'البخلاء', author: 'الجاحظ', category: 'Philosophy', description: 'تصوير دقيق وعميق لنفسية البخلاء والمجتمع.' },
  { id: 'al-bayan', title: 'البيان والتبيين', author: 'الجاحظ', category: 'Philosophy', description: 'من أمهات كتب الأدب العربي والفصاحة.' },

  // الأدب الكلاسيكي (Literature)
  { id: 'kalila-wa-dimna', title: 'كليلة ودمنة', author: 'ابن المقفع', category: 'Literature', description: 'حكايات رمزية على لسان الحيوانات تحمل حكماً سياسية وأخلاقية.' },
  { id: 'alf-layla', title: 'ألف ليلة وليلة', author: 'مجهول', category: 'Literature', description: 'مجموعة من الحكايات والقصص الشعبية العربية والشرقية.' },
  { id: 'al-mutanabbi', title: 'ديوان المتنبي', author: 'أبو الطيب المتنبي', category: 'Literature', description: 'أعظم دواوين الشعر العربي حكمة وبلاغة.' },
  { id: 'al-muallaqat', title: 'المعلقات السبع', author: 'شعراء الجاهلية', category: 'Literature', description: 'أشهر القصائد في تاريخ الشعر العربي الجاهلي.' },
  { id: 'majnoon-layla', title: 'مجنون ليلى', author: 'قيس بن الملوح', category: 'Literature', description: 'أشهر قصص العذرية والحب في التراث العربي.' },
  { id: 'al-hamasa', title: 'ديوان الحماسة', author: 'أبو تمام', category: 'Literature', description: 'مختارات شعرية تمثل روح الفروسية والشجاعة.' },
  { id: 'luzumiyat', title: 'اللزوميات', author: 'أبو العلاء المعري', category: 'Literature', description: 'شعر فلسفي عميق يعكس نظرة المعري للحياة.' },
  { id: 'maqamat', title: 'مقامات الحريري', author: 'الحريري', category: 'Literature', description: 'قصص قصيرة مسجوعة تبرز براعة اللغة العربية.' },
  { id: 'tarq-al-andalus', title: 'طوق الحمامة', author: 'ابن حزم الأندلسي', category: 'Literature', description: 'كتاب في الحب ومظاهره وأسبابه.' },
  { id: 'akhbar-al-hamqa', title: 'أخبار الحمقى والمغفلين', author: 'ابن الجوزي', category: 'Literature', description: 'كتاب طريف يسرد قصص الحمقى للعبرة والابتسام.' },

  // الروايات (Novel)
  { id: 'awlad-haratina', title: 'أولاد حارتنا', author: 'نجيب محفوظ', category: 'Novel', description: 'رواية فلسفية عميقة وحائزة على جائزة نوبل.' },
  { id: 'thulathiya', title: 'الثلاثية', author: 'نجيب محفوظ', category: 'Novel', description: 'أعظم عمل روائي عربي يرصد تحولات المجتمع المصري.' },
  { id: 'zaqaq-al-midaq', title: 'زقاق المدق', author: 'نجيب محفوظ', category: 'Novel', description: 'تصوير حي لحياة الحارة المصرية وتناقضاتها.' },
  { id: 'al-lis-wa-alkilab', title: 'اللص والكلاب', author: 'نجيب محفوظ', category: 'Novel', description: 'رواية سيكولوجية عن الخيانة والانتقام.' },
  { id: 'rijal-fil-shams', title: 'رجال في الشمس', author: 'غسان كنفاني', category: 'Novel', description: 'رواية مؤثرة عن مأساة اللجوء الفلسطيني.' },
  { id: 'aid-ila-haifa', title: 'عائد إلى حيفا', author: 'غسان كنفاني', category: 'Novel', description: 'قصة عودة بعد سنوات وتساؤلات عن الوطن والأبوة.' },
  { id: 'mawsim-alhijra', title: 'موسم الهجرة إلى الشمال', author: 'الطيب صالح', category: 'Novel', description: 'صراع الشرق والغرب في واحدة من أهم الروايات العربية.' },
  { id: 'mudun-al-milh', title: 'مدن الملح', author: 'عبد الرحمن منيف', category: 'Novel', description: 'ملحمة روائية توثق التحولات في الخليج بعد اكتشاف النفط.' },
  { id: 'azazeel', title: 'عزازيل', author: 'يوسف زيدان', category: 'Novel', description: 'رواية تاريخية لاهوتية تدور أحداثها في القرن الخامس الميلادي.' },
  { id: 'al-khubz-al-hafi', title: 'الخبز الحافي', author: 'محمد شكري', category: 'Novel', description: 'سيرة ذاتية روائية صريحة وجريئة.' },
  { id: 'thakirat-al-jasad', title: 'ذاكرة الجسد', author: 'أحلام مستغانمي', category: 'Novel', description: 'رواية شاعرية عن الثورة الجزائرية والحب والذاكرة.' },
  { id: 'frankenstein-baghdad', title: 'فرانكشتاين في بغداد', author: 'أحمد سعداوي', category: 'Novel', description: 'رواية سريالية عن مآسي الحرب في العراق.' },
  { id: 'saq-al-bambou', title: 'ساق البامبو', author: 'سعود السنعوسي', category: 'Novel', description: 'بحث عن الهوية والانتماء بين الفلبين والكويت.' },
  { id: 'al-abqaraiyat', title: 'العبقريات', author: 'عباس محمود العقاد', category: 'Novel', description: 'دراسات أدبية ونفسية لأبرز الشخصيات الإسلامية.' },
  { id: 'ana', title: 'أنا', author: 'عباس محمود العقاد', category: 'Novel', description: 'كتاب يتحدث فيه العقاد عن نفسه وتجاربه.' },

  // التاريخ (History)
  { id: 'bidaya-wa-nihaya', title: 'البداية والنهاية', author: 'ابن كثير', category: 'History', description: 'موسوعة تاريخية إسلامية ضخمة.' },
  { id: 'tarikh-al-khulafa', title: 'تاريخ الخلفاء', author: 'السيوطي', category: 'History', description: 'تأريخ موسع لحياة الخلفاء منذ عهد أبي بكر.' },
  { id: 'al-kamil-fi-altarikh', title: 'الكامل في التاريخ', author: 'ابن الأثير', category: 'History', description: 'أحد أهم وأشمل المصادر في التاريخ الإسلامي.' },
  { id: 'tarikh-al-tabari', title: 'تاريخ الطبري', author: 'الطبري', category: 'History', description: 'من أقدم وأعظم كتب التأريخ المعتمدة.' },
  { id: 'shakhsiyat-misr', title: 'شخصية مصر', author: 'جمال حمدان', category: 'History', description: 'دراسة عبقرية في جغرافية وتاريخ وشخصية مصر.' },
  { id: 'fitnat-al-kubra', title: 'الفتنة الكبرى', author: 'طه حسين', category: 'History', description: 'تحليل تاريخي وأدبي عميق لأحداث الفتنة في صدر الإسلام.' },
  { id: 'qisat-al-hadara', title: 'قصة الحضارة (مترجم)', author: 'ويل ديورانت', category: 'History', description: 'موسوعة ضخمة توثق تاريخ الحضارات البشرية.' },
  { id: 'tarikh-al-andalus', title: 'تاريخ الأندلس', author: 'ابن عذاري', category: 'History', description: 'توثيق شامل لتاريخ الأندلس والمغرب.' },
  { id: 'futuhat-makkiya', title: 'الفتوحات المكية', author: 'ابن عربي', category: 'History', description: 'موسوعة صوفية وروحية كبرى.' },
  { id: 'al-khutat', title: 'الخطط المقريزية', author: 'المقريزي', category: 'History', description: 'توثيق دقيق لتاريخ وتخطيط مدينة القاهرة.' }
];

async function getCoverImage(title) {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`);
    const data = await res.json();
    if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
      // Use the thumbnail URL, upgrade it to https if needed
      return data.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
    }
  } catch (err) {
    console.error(`Error fetching cover for ${title}:`, err.message);
  }
  // Fallback dynamic placeholder image with Arabic text
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=0D8ABC&color=fff&size=512&font-size=0.33`;
}

async function createDummyPdf(title) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Since standard fonts might not support Arabic well, we draw generic content
    doc.fontSize(24).text('Arabic Book Placeholder', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Book Title: ' + title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('This is a temporary placeholder PDF. Please upload the real Arabic PDF to Cloudflare R2.', { align: 'center' });
    doc.end();
  });
}

async function uploadToR2(key, buffer, contentType) {
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
}

async function main() {
  console.log('Generating Books Library...\n');
  const booksDataExport = [];

  for (let i = 0; i < arabicBooksData.length; i++) {
    const book = arabicBooksData[i];
    console.log(`[${i+1}/${arabicBooksData.length}] Processing: ${book.title}`);

    // 1. Get Cover URL
    const coverUrl = await getCoverImage(book.title);
    
    // 2. We don't download cover to R2, we will just use the URL directly to save time and bandwidth!
    // But wait, it's better to serve images fast. Google Books thumbnails are fast enough.
    const fileKey = `books/${book.id}.pdf`;

    // 3. Create and upload Dummy PDF
    try {
      const pdfBuffer = await createDummyPdf(book.title);
      await uploadToR2(fileKey, pdfBuffer, 'application/pdf');
    } catch (e) {
      console.error(`Failed to upload PDF for ${book.title}:`, e);
    }

    booksDataExport.push({
      ...book,
      fileKey,
      coverImage: coverUrl
    });
  }

  // Generate books.ts
  const tsContent = `export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  fileKey: string;
  coverImage: string;
}

export const books: Book[] = ${JSON.stringify(booksDataExport, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, 'src/data/books.ts'), tsContent);
  console.log('\n✅ src/data/books.ts generated successfully!');
}

main().catch(console.error);
