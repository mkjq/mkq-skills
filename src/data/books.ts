export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  fileKey: string;
}

export const books: Book[] = [
  // --- الفلسفة والفكر ---
  {
    id: "muqaddimah",
    title: "The Muqaddimah",
    author: "Ibn Khaldun",
    category: "Philosophy",
    description: "A foundational work of historiography and sociology by the great Arab scholar Ibn Khaldun, analyzing the rise and fall of civilizations.",
    fileKey: "books/the-muqaddimah-ibn-khaldun.pdf"
  },
  {
    id: "the-prince",
    title: "The Prince",
    author: "Niccolò Machiavelli",
    category: "Philosophy",
    description: "The classic treatise on political power, statecraft, and leadership that remains influential in political philosophy to this day.",
    fileKey: "books/the-prince-machiavelli.pdf"
  },
  {
    id: "the-republic",
    title: "The Republic",
    author: "Plato",
    category: "Philosophy",
    description: "Plato's seminal dialogue on justice, the ideal state, and the nature of the philosopher-king.",
    fileKey: "books/the-republic-plato.pdf"
  },
  {
    id: "the-art-of-war",
    title: "The Art of War",
    author: "Sun Tzu",
    category: "Philosophy",
    description: "The ancient Chinese military treatise on strategy, tactics, and the philosophy of warfare that transcends its military origins.",
    fileKey: "books/the-art-of-war-sun-tzu.pdf"
  },
  {
    id: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Philosophy",
    description: "Personal reflections of the Roman Emperor on Stoic philosophy, virtue, resilience, and the art of living a meaningful life.",
    fileKey: "books/meditations-marcus-aurelius.pdf"
  },
  {
    id: "beyond-good-and-evil",
    title: "Beyond Good and Evil",
    author: "Friedrich Nietzsche",
    category: "Philosophy",
    description: "Nietzsche's bold critique of traditional morality, exploring the concepts of the will to power and the übermensch.",
    fileKey: "books/beyond-good-and-evil-nietzsche.pdf"
  },
  {
    id: "critique-of-pure-reason",
    title: "Critique of Pure Reason",
    author: "Immanuel Kant",
    category: "Philosophy",
    description: "Kant's groundbreaking work that investigates the limits and possibilities of human knowledge and metaphysics.",
    fileKey: "books/critique-of-pure-reason-kant.pdf"
  },
  {
    id: "ethics",
    title: "Ethics",
    author: "Baruch Spinoza",
    category: "Philosophy",
    description: "Spinoza's masterpiece, a systematic treatise on God, nature, the human mind, and the path to freedom through understanding.",
    fileKey: "books/ethics-spinoza.pdf"
  },
  {
    id: "leviathan",
    title: "Leviathan",
    author: "Thomas Hobbes",
    category: "Philosophy",
    description: "A foundational text in political philosophy arguing for a strong central authority to prevent the chaos of the state of nature.",
    fileKey: "books/leviathan-thomas-hobbes.pdf"
  },
  {
    id: "two-treatises",
    title: "Two Treatises of Government",
    author: "John Locke",
    category: "Philosophy",
    description: "Locke's influential defense of natural rights, individual liberty, and the social contract as the basis of legitimate government.",
    fileKey: "books/two-treatises-of-government-john-locke.pdf"
  },
  {
    id: "social-contract",
    title: "The Social Contract",
    author: "Jean-Jacques Rousseau",
    category: "Philosophy",
    description: "Rousseau's exploration of the relationship between individual freedom and the authority of the state.",
    fileKey: "books/the-social-contract-rousseau.pdf"
  },
  {
    id: "communist-manifesto",
    title: "The Communist Manifesto",
    author: "Karl Marx",
    category: "Philosophy",
    description: "The revolutionary political pamphlet that outlined the principles of communism and class struggle.",
    fileKey: "books/the-communist-manifesto-marx.pdf"
  },
  {
    id: "on-liberty",
    title: "On Liberty",
    author: "John Stuart Mill",
    category: "Philosophy",
    description: "Mill's passionate defense of individual freedom against the tyranny of the majority and government overreach.",
    fileKey: "books/on-liberty-john-stuart-mill.pdf"
  },
  {
    id: "utilitarianism",
    title: "Utilitarianism",
    author: "John Stuart Mill",
    category: "Philosophy",
    description: "Mill's systematic defense of the greatest happiness principle as the foundation of moral reasoning.",
    fileKey: "books/utilitarianism-john-stuart-mill.pdf"
  },
  {
    id: "tao-te-ching",
    title: "Tao Te Ching",
    author: "Laozi",
    category: "Philosophy",
    description: "The foundational text of Taoism, offering profound wisdom on the nature of existence, simplicity, and harmony with the Tao.",
    fileKey: "books/tao-te-ching-laozi.pdf"
  },
  {
    id: "wealth-of-nations",
    title: "The Wealth of Nations",
    author: "Adam Smith",
    category: "Philosophy",
    description: "The foundational text of modern economics, analyzing free markets, the division of labor, and the invisible hand.",
    fileKey: "books/the-wealth-of-nations-adam-smith.pdf"
  },

  // --- الأدب الكلاسيكي ---
  {
    id: "iliad",
    title: "The Iliad",
    author: "Homer",
    category: "Literature",
    description: "The epic poem of the Trojan War, exploring themes of heroism, honor, wrath, and the human condition.",
    fileKey: "books/the-iliad-homer.pdf"
  },
  {
    id: "odyssey",
    title: "The Odyssey",
    author: "Homer",
    category: "Literature",
    description: "Homer's epic tale of Odysseus's perilous ten-year journey home after the fall of Troy.",
    fileKey: "books/the-odyssey-homer.pdf"
  },
  {
    id: "aeneid",
    title: "The Aeneid",
    author: "Virgil",
    category: "Literature",
    description: "Virgil's Latin epic poem telling the legendary story of Aeneas, a Trojan who traveled to Italy and became an ancestor of the Romans.",
    fileKey: "books/the-aeneid-virgil.pdf"
  },
  {
    id: "divine-comedy",
    title: "The Divine Comedy",
    author: "Dante Alighieri",
    category: "Literature",
    description: "Dante's monumental journey through Hell, Purgatory, and Paradise — one of the greatest works of world literature.",
    fileKey: "books/the-divine-comedy-dante.pdf"
  },
  {
    id: "paradise-lost",
    title: "Paradise Lost",
    author: "John Milton",
    category: "Literature",
    description: "Milton's epic poem on the fall of man, the rebellion of Satan, and the loss of the Garden of Eden.",
    fileKey: "books/paradise-lost-john-milton.pdf"
  },
  {
    id: "don-quixote",
    title: "Don Quixote",
    author: "Miguel de Cervantes",
    category: "Literature",
    description: "The comic masterpiece about a delusional knight-errant and his loyal squire, considered the first modern novel.",
    fileKey: "books/don-quixote-cervantes.pdf"
  },
  {
    id: "hamlet",
    title: "Hamlet",
    author: "William Shakespeare",
    category: "Literature",
    description: "Shakespeare's greatest tragedy of the Prince of Denmark, revenge, madness, and the human struggle with mortality.",
    fileKey: "books/hamlet-shakespeare.pdf"
  },
  {
    id: "macbeth",
    title: "Macbeth",
    author: "William Shakespeare",
    category: "Literature",
    description: "A dark tragedy of ambition, guilt, and the destructive consequences of unchecked power.",
    fileKey: "books/macbeth-shakespeare.pdf"
  },
  {
    id: "othello",
    title: "Othello",
    author: "William Shakespeare",
    category: "Literature",
    description: "Shakespeare's powerful tragedy of jealousy, manipulation, and the destruction of love and trust.",
    fileKey: "books/othello-shakespeare.pdf"
  },
  {
    id: "king-lear",
    title: "King Lear",
    author: "William Shakespeare",
    category: "Literature",
    description: "A devastating tragedy of aging, family betrayal, madness, and the fragility of power.",
    fileKey: "books/king-lear-shakespeare.pdf"
  },

  // --- الروايات الكلاسيكية ---
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Novel",
    description: "Austen's brilliant romantic novel exploring themes of love, class, and the dangers of hasty judgment in Georgian England.",
    fileKey: "books/pride-and-prejudice-jane-austen.pdf"
  },
  {
    id: "moby-dick",
    title: "Moby Dick",
    author: "Herman Melville",
    category: "Novel",
    description: "Captain Ahab's obsessive quest to hunt the great white whale — an allegory of man versus nature and obsession.",
    fileKey: "books/moby-dick-herman-melville.pdf"
  },
  {
    id: "war-and-peace",
    title: "War and Peace",
    author: "Leo Tolstoy",
    category: "Novel",
    description: "Tolstoy's epic masterpiece depicting Russian society during the Napoleonic Wars, weaving history with deeply personal stories.",
    fileKey: "books/war-and-peace-leo-tolstoy.pdf"
  },
  {
    id: "crime-and-punishment",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    category: "Novel",
    description: "A profound psychological novel exploring guilt, redemption, and the moral consequences of a young man's crime.",
    fileKey: "books/crime-and-punishment-dostoevsky.pdf"
  },
  {
    id: "brothers-karamazov",
    title: "The Brothers Karamazov",
    author: "Fyodor Dostoevsky",
    category: "Novel",
    description: "Dostoevsky's final and greatest novel — a philosophical drama of faith, doubt, morality, and family conflict.",
    fileKey: "books/the-brothers-karamazov-dostoevsky.pdf"
  },
  {
    id: "anna-karenina",
    title: "Anna Karenina",
    author: "Leo Tolstoy",
    category: "Novel",
    description: "Tolstoy's tragic novel of love, infidelity, and social conventions in Russian aristocratic society.",
    fileKey: "books/anna-karenina-leo-tolstoy.pdf"
  },
  {
    id: "les-miserables",
    title: "Les Misérables",
    author: "Victor Hugo",
    category: "Novel",
    description: "Hugo's sweeping epic of justice, redemption, and revolution in 19th-century France, following the ex-convict Jean Valjean.",
    fileKey: "books/les-miserables-victor-hugo.pdf"
  },
  {
    id: "count-of-monte-cristo",
    title: "The Count of Monte Cristo",
    author: "Alexandre Dumas",
    category: "Novel",
    description: "The ultimate tale of betrayal, imprisonment, and an elaborate quest for revenge and justice.",
    fileKey: "books/the-count-of-monte-cristo-dumas.pdf"
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    category: "Novel",
    description: "The groundbreaking Gothic novel about a scientist who creates life and faces the horrifying consequences of playing God.",
    fileKey: "books/frankenstein-mary-shelley.pdf"
  },
  {
    id: "dracula",
    title: "Dracula",
    author: "Bram Stoker",
    category: "Novel",
    description: "The definitive vampire novel, a masterpiece of Gothic horror that has shaped popular culture for over a century.",
    fileKey: "books/dracula-bram-stoker.pdf"
  },
  {
    id: "dorian-gray",
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    category: "Novel",
    description: "Wilde's only novel — a dark tale of beauty, corruption, and the hidden costs of a life devoted to pleasure.",
    fileKey: "books/the-picture-of-dorian-gray-oscar-wilde.pdf"
  },
  {
    id: "alice-in-wonderland",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    category: "Novel",
    description: "The beloved fantasy of a girl who falls through a rabbit hole into a world of whimsical nonsense and unforgettable characters.",
    fileKey: "books/alice-in-wonderland-lewis-carroll.pdf"
  },
  {
    id: "gullivers-travels",
    title: "Gulliver's Travels",
    author: "Jonathan Swift",
    category: "Novel",
    description: "Swift's brilliant satirical novel of a ship's surgeon who visits fantastical lands, critiquing human nature and society.",
    fileKey: "books/gullivers-travels-jonathan-swift.pdf"
  },
  {
    id: "jane-eyre",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    category: "Novel",
    description: "A groundbreaking novel of an independent woman's moral and spiritual growth in the face of oppression.",
    fileKey: "books/jane-eyre-charlotte-bronte.pdf"
  },
  {
    id: "wuthering-heights",
    title: "Wuthering Heights",
    author: "Emily Brontë",
    category: "Novel",
    description: "A wild, passionate tale of love and revenge set on the Yorkshire moors, one of English literature's most haunting works.",
    fileKey: "books/wuthering-heights-emily-bronte.pdf"
  },
  {
    id: "huckleberry-finn",
    title: "The Adventures of Huckleberry Finn",
    author: "Mark Twain",
    category: "Novel",
    description: "Twain's masterpiece following a young boy's journey down the Mississippi River — a profound commentary on race, freedom, and American society.",
    fileKey: "books/the-adventures-of-huckleberry-finn-mark-twain.pdf"
  },
  {
    id: "great-expectations",
    title: "Great Expectations",
    author: "Charles Dickens",
    category: "Novel",
    description: "Dickens's compelling story of an orphan's rise from poverty to gentleman, exploring ambition, loyalty, and self-discovery.",
    fileKey: "books/great-expectations-charles-dickens.pdf"
  },
  {
    id: "tale-of-two-cities",
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    category: "Novel",
    description: "A gripping historical novel set during the French Revolution, exploring sacrifice, resurrection, and the best and worst of humanity.",
    fileKey: "books/a-tale-of-two-cities-charles-dickens.pdf"
  },

  // --- التاريخ ---
  {
    id: "peloponnesian-war",
    title: "The History of the Peloponnesian War",
    author: "Thucydides",
    category: "History",
    description: "The first great work of political history, documenting the devastating war between Athens and Sparta.",
    fileKey: "books/the-history-of-the-peloponnesian-war-thucydides.pdf"
  },
];
