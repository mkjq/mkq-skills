export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  fileKey: string;
  coverImage: string;
}

export const books: Book[] = [
  {
    "id": "muqaddimah",
    "title": "مقدمة ابن خلدون",
    "author": "ابن خلدون",
    "category": "Philosophy",
    "description": "من أهم الكتب العربية في علم الاجتماع والتاريخ.",
    "fileKey": "books/muqaddimah.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%85%D9%82%D8%AF%D9%85%D8%A9%20%D8%A7%D8%A8%D9%86%20%D8%AE%D9%84%D8%AF%D9%88%D9%86&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "the-prophet",
    "title": "النبي",
    "author": "جبران خليل جبران",
    "category": "Philosophy",
    "description": "كتاب فلسفي وروحي يتناول قضايا الحياة والموت والحب.",
    "fileKey": "books/the-prophet.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%86%D8%A8%D9%8A&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "taha-hussein-ayam",
    "title": "الأيام",
    "author": "طه حسين",
    "category": "Philosophy",
    "description": "سيرة ذاتية لعميد الأدب العربي طه حسين تعكس الحياة في مصر.",
    "fileKey": "books/taha-hussein-ayam.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%A3%D9%8A%D8%A7%D9%85&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-islam-wa-osoloho",
    "title": "الإسلام وأصول الحكم",
    "author": "علي عبد الرازق",
    "category": "Philosophy",
    "description": "كتاب يناقش الخلافة والحكم في التاريخ الإسلامي.",
    "fileKey": "books/al-islam-wa-osoloho.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D9%88%D8%A3%D8%B5%D9%88%D9%84%20%D8%A7%D9%84%D8%AD%D9%83%D9%85&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "hayy-ibn-yaqdhan",
    "title": "حي بن يقظان",
    "author": "ابن طفيل",
    "category": "Philosophy",
    "description": "قصة فلسفية تلخص الفكر الفلسفي الأندلسي.",
    "fileKey": "books/hayy-ibn-yaqdhan.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AD%D9%8A%20%D8%A8%D9%86%20%D9%8A%D9%82%D8%B8%D8%A7%D9%86&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "tahafut-al-falasifa",
    "title": "تهافت الفلاسفة",
    "author": "أبو حامد الغزالي",
    "category": "Philosophy",
    "description": "نقد عميق للفلسفة اليونانية والمنطق من منظور إسلامي.",
    "fileKey": "books/tahafut-al-falasifa.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AA%D9%87%D8%A7%D9%81%D8%AA%20%D8%A7%D9%84%D9%81%D9%84%D8%A7%D8%B3%D9%81%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-munqidh",
    "title": "المنقذ من الضلال",
    "author": "أبو حامد الغزالي",
    "category": "Philosophy",
    "description": "سيرة ذاتية فكرية ورحلة نحو اليقين.",
    "fileKey": "books/al-munqidh.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%85%D9%86%D9%82%D8%B0%20%D9%85%D9%86%20%D8%A7%D9%84%D8%B6%D9%84%D8%A7%D9%84&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "risalat-al-ghufran",
    "title": "رسالة الغفران",
    "author": "أبو العلاء المعري",
    "category": "Philosophy",
    "description": "رحلة خيالية فلسفية في الدار الآخرة.",
    "fileKey": "books/risalat-al-ghufran.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B1%D8%B3%D8%A7%D9%84%D8%A9%20%D8%A7%D9%84%D8%BA%D9%81%D8%B1%D8%A7%D9%86&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-bukhala",
    "title": "البخلاء",
    "author": "الجاحظ",
    "category": "Philosophy",
    "description": "تصوير دقيق وعميق لنفسية البخلاء والمجتمع.",
    "fileKey": "books/al-bukhala.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%A8%D8%AE%D9%84%D8%A7%D8%A1&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-bayan",
    "title": "البيان والتبيين",
    "author": "الجاحظ",
    "category": "Philosophy",
    "description": "من أمهات كتب الأدب العربي والفصاحة.",
    "fileKey": "books/al-bayan.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%20%D9%88%D8%A7%D9%84%D8%AA%D8%A8%D9%8A%D9%8A%D9%86&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "kalila-wa-dimna",
    "title": "كليلة ودمنة",
    "author": "ابن المقفع",
    "category": "Literature",
    "description": "حكايات رمزية على لسان الحيوانات تحمل حكماً سياسية وأخلاقية.",
    "fileKey": "books/kalila-wa-dimna.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%83%D9%84%D9%8A%D9%84%D8%A9%20%D9%88%D8%AF%D9%85%D9%86%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "alf-layla",
    "title": "ألف ليلة وليلة",
    "author": "مجهول",
    "category": "Literature",
    "description": "مجموعة من الحكايات والقصص الشعبية العربية والشرقية.",
    "fileKey": "books/alf-layla.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A3%D9%84%D9%81%20%D9%84%D9%8A%D9%84%D8%A9%20%D9%88%D9%84%D9%8A%D9%84%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-mutanabbi",
    "title": "ديوان المتنبي",
    "author": "أبو الطيب المتنبي",
    "category": "Literature",
    "description": "أعظم دواوين الشعر العربي حكمة وبلاغة.",
    "fileKey": "books/al-mutanabbi.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AF%D9%8A%D9%88%D8%A7%D9%86%20%D8%A7%D9%84%D9%85%D8%AA%D9%86%D8%A8%D9%8A&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-muallaqat",
    "title": "المعلقات السبع",
    "author": "شعراء الجاهلية",
    "category": "Literature",
    "description": "أشهر القصائد في تاريخ الشعر العربي الجاهلي.",
    "fileKey": "books/al-muallaqat.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%82%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B3%D8%A8%D8%B9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "majnoon-layla",
    "title": "مجنون ليلى",
    "author": "قيس بن الملوح",
    "category": "Literature",
    "description": "أشهر قصص العذرية والحب في التراث العربي.",
    "fileKey": "books/majnoon-layla.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%85%D8%AC%D9%86%D9%88%D9%86%20%D9%84%D9%8A%D9%84%D9%89&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-hamasa",
    "title": "ديوان الحماسة",
    "author": "أبو تمام",
    "category": "Literature",
    "description": "مختارات شعرية تمثل روح الفروسية والشجاعة.",
    "fileKey": "books/al-hamasa.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AF%D9%8A%D9%88%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%85%D8%A7%D8%B3%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "luzumiyat",
    "title": "اللزوميات",
    "author": "أبو العلاء المعري",
    "category": "Literature",
    "description": "شعر فلسفي عميق يعكس نظرة المعري للحياة.",
    "fileKey": "books/luzumiyat.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%84%D8%B2%D9%88%D9%85%D9%8A%D8%A7%D8%AA&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "maqamat",
    "title": "مقامات الحريري",
    "author": "الحريري",
    "category": "Literature",
    "description": "قصص قصيرة مسجوعة تبرز براعة اللغة العربية.",
    "fileKey": "books/maqamat.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%85%D9%82%D8%A7%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%AD%D8%B1%D9%8A%D8%B1%D9%8A&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "tarq-al-andalus",
    "title": "طوق الحمامة",
    "author": "ابن حزم الأندلسي",
    "category": "Literature",
    "description": "كتاب في الحب ومظاهره وأسبابه.",
    "fileKey": "books/tarq-al-andalus.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B7%D9%88%D9%82%20%D8%A7%D9%84%D8%AD%D9%85%D8%A7%D9%85%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "akhbar-al-hamqa",
    "title": "أخبار الحمقى والمغفلين",
    "author": "ابن الجوزي",
    "category": "Literature",
    "description": "كتاب طريف يسرد قصص الحمقى للعبرة والابتسام.",
    "fileKey": "books/akhbar-al-hamqa.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1%20%D8%A7%D9%84%D8%AD%D9%85%D9%82%D9%89%20%D9%88%D8%A7%D9%84%D9%85%D8%BA%D9%81%D9%84%D9%8A%D9%86&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "awlad-haratina",
    "title": "أولاد حارتنا",
    "author": "نجيب محفوظ",
    "category": "Novel",
    "description": "رواية فلسفية عميقة وحائزة على جائزة نوبل.",
    "fileKey": "books/awlad-haratina.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A3%D9%88%D9%84%D8%A7%D8%AF%20%D8%AD%D8%A7%D8%B1%D8%AA%D9%86%D8%A7&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "thulathiya",
    "title": "الثلاثية",
    "author": "نجيب محفوظ",
    "category": "Novel",
    "description": "أعظم عمل روائي عربي يرصد تحولات المجتمع المصري.",
    "fileKey": "books/thulathiya.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%AB%D9%84%D8%A7%D8%AB%D9%8A%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "zaqaq-al-midaq",
    "title": "زقاق المدق",
    "author": "نجيب محفوظ",
    "category": "Novel",
    "description": "تصوير حي لحياة الحارة المصرية وتناقضاتها.",
    "fileKey": "books/zaqaq-al-midaq.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B2%D9%82%D8%A7%D9%82%20%D8%A7%D9%84%D9%85%D8%AF%D9%82&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-lis-wa-alkilab",
    "title": "اللص والكلاب",
    "author": "نجيب محفوظ",
    "category": "Novel",
    "description": "رواية سيكولوجية عن الخيانة والانتقام.",
    "fileKey": "books/al-lis-wa-alkilab.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%84%D8%B5%20%D9%88%D8%A7%D9%84%D9%83%D9%84%D8%A7%D8%A8&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "rijal-fil-shams",
    "title": "رجال في الشمس",
    "author": "غسان كنفاني",
    "category": "Novel",
    "description": "رواية مؤثرة عن مأساة اللجوء الفلسطيني.",
    "fileKey": "books/rijal-fil-shams.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B1%D8%AC%D8%A7%D9%84%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B4%D9%85%D8%B3&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "aid-ila-haifa",
    "title": "عائد إلى حيفا",
    "author": "غسان كنفاني",
    "category": "Novel",
    "description": "قصة عودة بعد سنوات وتساؤلات عن الوطن والأبوة.",
    "fileKey": "books/aid-ila-haifa.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B9%D8%A7%D8%A6%D8%AF%20%D8%A5%D9%84%D9%89%20%D8%AD%D9%8A%D9%81%D8%A7&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "mawsim-alhijra",
    "title": "موسم الهجرة إلى الشمال",
    "author": "الطيب صالح",
    "category": "Novel",
    "description": "صراع الشرق والغرب في واحدة من أهم الروايات العربية.",
    "fileKey": "books/mawsim-alhijra.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%85%D9%88%D8%B3%D9%85%20%D8%A7%D9%84%D9%87%D8%AC%D8%B1%D8%A9%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D8%B4%D9%85%D8%A7%D9%84&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "mudun-al-milh",
    "title": "مدن الملح",
    "author": "عبد الرحمن منيف",
    "category": "Novel",
    "description": "ملحمة روائية توثق التحولات في الخليج بعد اكتشاف النفط.",
    "fileKey": "books/mudun-al-milh.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%85%D8%AF%D9%86%20%D8%A7%D9%84%D9%85%D9%84%D8%AD&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "azazeel",
    "title": "عزازيل",
    "author": "يوسف زيدان",
    "category": "Novel",
    "description": "رواية تاريخية لاهوتية تدور أحداثها في القرن الخامس الميلادي.",
    "fileKey": "books/azazeel.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B9%D8%B2%D8%A7%D8%B2%D9%8A%D9%84&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-khubz-al-hafi",
    "title": "الخبز الحافي",
    "author": "محمد شكري",
    "category": "Novel",
    "description": "سيرة ذاتية روائية صريحة وجريئة.",
    "fileKey": "books/al-khubz-al-hafi.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%AE%D8%A8%D8%B2%20%D8%A7%D9%84%D8%AD%D8%A7%D9%81%D9%8A&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "thakirat-al-jasad",
    "title": "ذاكرة الجسد",
    "author": "أحلام مستغانمي",
    "category": "Novel",
    "description": "رواية شاعرية عن الثورة الجزائرية والحب والذاكرة.",
    "fileKey": "books/thakirat-al-jasad.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B0%D8%A7%D9%83%D8%B1%D8%A9%20%D8%A7%D9%84%D8%AC%D8%B3%D8%AF&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "frankenstein-baghdad",
    "title": "فرانكشتاين في بغداد",
    "author": "أحمد سعداوي",
    "category": "Novel",
    "description": "رواية سريالية عن مآسي الحرب في العراق.",
    "fileKey": "books/frankenstein-baghdad.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%81%D8%B1%D8%A7%D9%86%D9%83%D8%B4%D8%AA%D8%A7%D9%8A%D9%86%20%D9%81%D9%8A%20%D8%A8%D8%BA%D8%AF%D8%A7%D8%AF&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "saq-al-bambou",
    "title": "ساق البامبو",
    "author": "سعود السنعوسي",
    "category": "Novel",
    "description": "بحث عن الهوية والانتماء بين الفلبين والكويت.",
    "fileKey": "books/saq-al-bambou.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B3%D8%A7%D9%82%20%D8%A7%D9%84%D8%A8%D8%A7%D9%85%D8%A8%D9%88&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-abqaraiyat",
    "title": "العبقريات",
    "author": "عباس محمود العقاد",
    "category": "Novel",
    "description": "دراسات أدبية ونفسية لأبرز الشخصيات الإسلامية.",
    "fileKey": "books/al-abqaraiyat.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%B9%D8%A8%D9%82%D8%B1%D9%8A%D8%A7%D8%AA&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "ana",
    "title": "أنا",
    "author": "عباس محمود العقاد",
    "category": "Novel",
    "description": "كتاب يتحدث فيه العقاد عن نفسه وتجاربه.",
    "fileKey": "books/ana.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A3%D9%86%D8%A7&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "bidaya-wa-nihaya",
    "title": "البداية والنهاية",
    "author": "ابن كثير",
    "category": "History",
    "description": "موسوعة تاريخية إسلامية ضخمة.",
    "fileKey": "books/bidaya-wa-nihaya.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%A8%D8%AF%D8%A7%D9%8A%D8%A9%20%D9%88%D8%A7%D9%84%D9%86%D9%87%D8%A7%D9%8A%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "tarikh-al-khulafa",
    "title": "تاريخ الخلفاء",
    "author": "السيوطي",
    "category": "History",
    "description": "تأريخ موسع لحياة الخلفاء منذ عهد أبي بكر.",
    "fileKey": "books/tarikh-al-khulafa.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE%20%D8%A7%D9%84%D8%AE%D9%84%D9%81%D8%A7%D8%A1&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-kamil-fi-altarikh",
    "title": "الكامل في التاريخ",
    "author": "ابن الأثير",
    "category": "History",
    "description": "أحد أهم وأشمل المصادر في التاريخ الإسلامي.",
    "fileKey": "books/al-kamil-fi-altarikh.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%83%D8%A7%D9%85%D9%84%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "tarikh-al-tabari",
    "title": "تاريخ الطبري",
    "author": "الطبري",
    "category": "History",
    "description": "من أقدم وأعظم كتب التأريخ المعتمدة.",
    "fileKey": "books/tarikh-al-tabari.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE%20%D8%A7%D9%84%D8%B7%D8%A8%D8%B1%D9%8A&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "shakhsiyat-misr",
    "title": "شخصية مصر",
    "author": "جمال حمدان",
    "category": "History",
    "description": "دراسة عبقرية في جغرافية وتاريخ وشخصية مصر.",
    "fileKey": "books/shakhsiyat-misr.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9%20%D9%85%D8%B5%D8%B1&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "fitnat-al-kubra",
    "title": "الفتنة الكبرى",
    "author": "طه حسين",
    "category": "History",
    "description": "تحليل تاريخي وأدبي عميق لأحداث الفتنة في صدر الإسلام.",
    "fileKey": "books/fitnat-al-kubra.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9%20%D8%A7%D9%84%D9%83%D8%A8%D8%B1%D9%89&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "qisat-al-hadara",
    "title": "قصة الحضارة (مترجم)",
    "author": "ويل ديورانت",
    "category": "History",
    "description": "موسوعة ضخمة توثق تاريخ الحضارات البشرية.",
    "fileKey": "books/qisat-al-hadara.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D9%82%D8%B5%D8%A9%20%D8%A7%D9%84%D8%AD%D8%B6%D8%A7%D8%B1%D8%A9%20(%D9%85%D8%AA%D8%B1%D8%AC%D9%85)&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "tarikh-al-andalus",
    "title": "تاريخ الأندلس",
    "author": "ابن عذاري",
    "category": "History",
    "description": "توثيق شامل لتاريخ الأندلس والمغرب.",
    "fileKey": "books/tarikh-al-andalus.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE%20%D8%A7%D9%84%D8%A3%D9%86%D8%AF%D9%84%D8%B3&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "futuhat-makkiya",
    "title": "الفتوحات المكية",
    "author": "ابن عربي",
    "category": "History",
    "description": "موسوعة صوفية وروحية كبرى.",
    "fileKey": "books/futuhat-makkiya.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%81%D8%AA%D9%88%D8%AD%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D9%83%D9%8A%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  },
  {
    "id": "al-khutat",
    "title": "الخطط المقريزية",
    "author": "المقريزي",
    "category": "History",
    "description": "توثيق دقيق لتاريخ وتخطيط مدينة القاهرة.",
    "fileKey": "books/al-khutat.pdf",
    "coverImage": "https://ui-avatars.com/api/?name=%D8%A7%D9%84%D8%AE%D8%B7%D8%B7%20%D8%A7%D9%84%D9%85%D9%82%D8%B1%D9%8A%D8%B2%D9%8A%D8%A9&background=0D8ABC&color=fff&size=512&font-size=0.33"
  }
];
