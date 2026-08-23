import { PrismaClient } from './generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Ensure a community creator user exists
  const creatorEmail = "community@mentatry.com";
  let creator = await prisma.user.findUnique({
    where: { email: creatorEmail },
  });

  if (!creator) {
    const hashedPassword = await bcrypt.hash("mentatry_community_curated_2026", 10);
    creator = await prisma.user.create({
      data: {
        email: creatorEmail,
        password: hashedPassword,
        firstName: "Mentatry Community",
        lastName: "Staff",
      },
    });
  }

  const starterQuizzes = [
    {
      title: "JavaScript & Modern Web Essentials",
      sourceType: "TOPIC" as const,
      sourceContent: "JavaScript, React, Web Development",
      difficulty: "easy",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "Which keyword is used to declare a block-scoped variable that cannot be reassigned?",
          options: ["var", "let", "const", "static"],
          correctIndex: 2,
          explanation: "The 'const' declaration creates block-scoped constants that cannot be reassigned through reassignment.",
          order: 1,
        },
        {
          text: "What will `typeof null` return in JavaScript?",
          options: ["'null'", "'undefined'", "'object'", "'boolean'"],
          correctIndex: 2,
          explanation: "In JavaScript, typeof null returns 'object'. This is a historical bug in the original language implementation that remains for backward compatibility.",
          order: 2,
        },
        {
          text: "Which array method creates a new array with all elements that pass the provided test function?",
          options: ["map()", "filter()", "forEach()", "reduce()"],
          correctIndex: 1,
          explanation: "The filter() method creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test.",
          order: 3,
        },
        {
          text: "What does the '===' operator check in JavaScript?",
          options: ["Value equality only", "Type equality only", "Both value and type equality (strict)", "Memory reference only"],
          correctIndex: 2,
          explanation: "The strict equality operator (===) checks whether its two operands are equal, returning a Boolean result without performing type coercion.",
          order: 4,
        },
        {
          text: "Which HTML5 feature is used to draw graphics on the fly via JavaScript?",
          options: ["<canvas>", "<svg>", "<graphic>", "<render>"],
          correctIndex: 0,
          explanation: "The HTML <canvas> element is used to draw graphics on a web page via JavaScript scripting.",
          order: 5,
        },
      ],
    },
    {
      title: "World Geography, Flags & Capitals",
      sourceType: "TOPIC" as const,
      sourceContent: "World Geography, Capitals, Countries",
      difficulty: "medium",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "What is the capital city of Australia?",
          options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
          correctIndex: 2,
          explanation: "Canberra is the federal capital of Australia, chosen as a compromise between Sydney and Melbourne in 1908.",
          order: 1,
        },
        {
          text: "Which is the longest river in the world by overall length?",
          options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
          correctIndex: 1,
          explanation: "The Nile River in Africa is traditionally recognized as the longest river in the world, spanning approximately 6,650 kilometers (4,132 miles).",
          order: 2,
        },
        {
          text: "Which country has the most natural lakes in the world?",
          options: ["United States", "Russia", "Canada", "Finland"],
          correctIndex: 2,
          explanation: "Canada has more lakes than the rest of the world combined, with an estimated 60% of all natural lakes globally.",
          order: 3,
        },
        {
          text: "Mount Kilimanjaro is the highest peak in Africa. In which country is it located?",
          options: ["Kenya", "Tanzania", "Uganda", "Ethiopia"],
          correctIndex: 1,
          explanation: "Mount Kilimanjaro is a dormant volcano in northeastern Tanzania, rising 5,895 metres (19,341 ft) above sea level.",
          order: 4,
        },
        {
          text: "Which strait separates the continents of Asia and North America?",
          options: ["Gibraltar Strait", "Bering Strait", "Bosporus Strait", "Malacca Strait"],
          correctIndex: 1,
          explanation: "The Bering Strait connects the Bering Sea with the Chukchi Sea and separates Russia from Alaska (North America).",
          order: 5,
        },
      ],
    },
    {
      title: "Space Exploration, Astronomy & Cosmos",
      sourceType: "TOPIC" as const,
      sourceContent: "Astronomy, Astrophysics, NASA, Space",
      difficulty: "hard",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "What is the boundary surrounding a black hole beyond which nothing can escape called?",
          options: ["Singularity", "Photon Sphere", "Event Horizon", "Accretion Disk"],
          correctIndex: 2,
          explanation: "The Event Horizon is the threshold around a black hole where the escape velocity exceeds the speed of light.",
          order: 1,
        },
        {
          text: "Which space telescope was launched in December 2021 as the successor to the Hubble Space Telescope?",
          options: ["James Webb Space Telescope", "Kepler Space Telescope", "Chandra X-ray Observatory", "Spitzer Space Telescope"],
          correctIndex: 0,
          explanation: "The James Webb Space Telescope (JWST) was launched on December 25, 2021, to conduct infrared astronomy.",
          order: 2,
        },
        {
          text: "What is the most abundant element in the universe by mass?",
          options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
          correctIndex: 1,
          explanation: "Hydrogen accounts for roughly 75% of the elemental mass of the universe, with Helium making up almost all the remaining 25%.",
          order: 3,
        },
        {
          text: "Olympus Mons, the largest volcano in the Solar System, is found on which planet?",
          options: ["Venus", "Mars", "Mercury", "Jupiter"],
          correctIndex: 1,
          explanation: "Olympus Mons is a massive shield volcano on Mars that stands over 21.9 km (13.6 mi) high, almost three times taller than Mount Everest.",
          order: 4,
        },
        {
          text: "What spectral type classification describes our Sun?",
          options: ["O-type star", "B-type star", "G-type main-sequence star", "M-type red dwarf"],
          correctIndex: 2,
          explanation: "The Sun is a G-type main-sequence star (specifically G2V), often informally referred to as a yellow dwarf.",
          order: 5,
        },
      ],
    },
    {
      title: "Cinema, Pop Culture & Blockbuster Trivia",
      sourceType: "TOPIC" as const,
      sourceContent: "Movies, Hollywood, Pop Culture",
      difficulty: "easy",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "In the Marvel Cinematic Universe, what is the fictional metal mined in Wakanda?",
          options: ["Adamantium", "Vibranium", "Beskar", "Kryptonite"],
          correctIndex: 1,
          explanation: "Vibranium is the extraordinarily durable, vibration-absorbing metal native to the fictional African nation of Wakanda.",
          order: 1,
        },
        {
          text: "Which movie won the Academy Award for Best Picture in 2024 (awarded for 2023 films)?",
          options: ["Barbie", "Oppenheimer", "Poor Things", "Killers of the Flower Moon"],
          correctIndex: 1,
          explanation: "Christopher Nolan's 'Oppenheimer' won seven Academy Awards at the 96th Oscars, including Best Picture and Best Director.",
          order: 2,
        },
        {
          text: "In 'The Lord of the Rings', what is the name of the volcano where the One Ring must be destroyed?",
          options: ["Mount Doom", "Erebor", "Caradhras", "Moria"],
          correctIndex: 0,
          explanation: "Mount Doom (Orodruin) in Mordor is the only place with the fiery heat capable of unmaking the One Ring.",
          order: 3,
        },
        {
          text: "Which iconic sci-fi film popularized the famous line 'May the Force be with you'?",
          options: ["Star Trek", "Star Wars", "Blade Runner", "Dune"],
          correctIndex: 1,
          explanation: "George Lucas's 'Star Wars' (1977) introduced the Jedi and the immortal phrase 'May the Force be with you.'",
          order: 4,
        },
        {
          text: "In 'Harry Potter', which magical creature pulls the carriages that take students to Hogwarts?",
          options: ["Hippogriffs", "Thestrals", "Centaurs", "Dragons"],
          correctIndex: 1,
          explanation: "Thestrals are winged skeletal horses visible only to those who have witnessed and accepted death.",
          order: 5,
        },
      ],
    },
    {
      title: "Human Biology, Cells & Genetics",
      sourceType: "TOPIC" as const,
      sourceContent: "Biology, Cells, Genetics, Human Body",
      difficulty: "medium",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "What organelle is known as the 'powerhouse of the cell' for producing ATP?",
          options: ["Ribosome", "Mitochondria", "Golgi Apparatus", "Endoplasmic Reticulum"],
          correctIndex: 1,
          explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions through ATP production.",
          order: 1,
        },
        {
          text: "How many chromosomes do human somatic (body) cells typically contain?",
          options: ["23", "46", "48", "92"],
          correctIndex: 1,
          explanation: "Human somatic cells are diploid and contain 46 chromosomes organized into 23 homologous pairs.",
          order: 2,
        },
        {
          text: "Which blood type is known as the universal donor for red blood cells?",
          options: ["A positive", "AB positive", "O negative", "O positive"],
          correctIndex: 2,
          explanation: "O negative red blood cells lack A, B, and Rh surface antigens, meaning they can safely be transfused to nearly any recipient.",
          order: 3,
        },
        {
          text: "Which protein is responsible for carrying oxygen in red blood cells?",
          options: ["Hemoglobin", "Myoglobin", "Collagen", "Keratin"],
          correctIndex: 0,
          explanation: "Hemoglobin is the iron-containing oxygen-transport metalloprotein in red blood cells.",
          order: 4,
        },
        {
          text: "What are the four nucleotide bases found in DNA?",
          options: [
            "Adenine, Cytosine, Guanine, Thymine",
            "Adenine, Cytosine, Guanine, Uracil",
            "Alanine, Cysteine, Glycine, Threonine",
            "Amine, Carboxyl, Glucose, Tryptophan"
          ],
          correctIndex: 0,
          explanation: "DNA consists of four chemical bases: Adenine (A), Guanine (G), Cytosine (C), and Thymine (T).",
          order: 5,
        },
      ],
    },
    {
      title: "Python Programming Essentials",
      sourceType: "TOPIC" as const,
      sourceContent: "Python, Coding, Programming",
      difficulty: "easy",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "How do you start a single-line comment in Python?",
          options: ["//", "/*", "#", "--"],
          correctIndex: 2,
          explanation: "In Python, single-line comments begin with the hash symbol (#).",
          order: 1,
        },
        {
          text: "Which built-in Python data structure is ordered, mutable, and allows duplicate elements?",
          options: ["List", "Tuple", "Set", "Dictionary"],
          correctIndex: 0,
          explanation: "A Python list is an ordered, mutable sequence that can contain duplicate items of mixed types.",
          order: 2,
        },
        {
          text: "Which function is used to get the number of items in a list or string?",
          options: ["size()", "count()", "len()", "length()"],
          correctIndex: 2,
          explanation: "The built-in len() function returns the number of items in an object.",
          order: 3,
        },
        {
          text: "What will `bool([])` evaluate to in Python?",
          options: ["True", "False", "None", "TypeError"],
          correctIndex: 1,
          explanation: "Empty collections in Python (like empty lists [], dictionaries {}, or sets ()) are considered 'falsy' and evaluate to False.",
          order: 4,
        },
        {
          text: "Which keyword is used to define a function in Python?",
          options: ["function", "def", "func", "define"],
          correctIndex: 1,
          explanation: "The 'def' keyword is used to create user-defined functions in Python.",
          order: 5,
        },
      ],
    },
    {
      title: "World History & Ancient Civilizations",
      sourceType: "TOPIC" as const,
      sourceContent: "World History, Rome, Egypt, Greece",
      difficulty: "medium",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "Who was the first Emperor of the Roman Empire?",
          options: ["Julius Caesar", "Augustus (Octavian)", "Nero", "Marcus Aurelius"],
          correctIndex: 1,
          explanation: "Augustus (formerly Octavian) became the first Roman Emperor in 27 BC following the fall of the Roman Republic.",
          order: 1,
        },
        {
          text: "The ancient city of Babylon was located in which modern-day country?",
          options: ["Egypt", "Iraq", "Iran", "Syria"],
          correctIndex: 1,
          explanation: "Babylon was a major city of ancient Mesopotamia located in modern-day Iraq, south of Baghdad.",
          order: 2,
        },
        {
          text: "In what year did the French Revolution begin with the storming of the Bastille?",
          options: ["1776", "1789", "1804", "1815"],
          correctIndex: 1,
          explanation: "The French Revolution began in 1789, punctuated by the storming of the Bastille fortress on July 14, 1789.",
          order: 3,
        },
        {
          text: "Which ancient wonder of the world is the only one that still exists today?",
          options: ["Colossus of Rhodes", "Hanging Gardens of Babylon", "Great Pyramid of Giza", "Lighthouse of Alexandria"],
          correctIndex: 2,
          explanation: "The Great Pyramid of Giza in Egypt is the oldest of the ancient wonders and the only one substantially intact.",
          order: 4,
        },
        {
          text: "Who was the legendary leader of the Mongol Empire who founded the largest contiguous empire in history?",
          options: ["Genghis Khan", "Kublai Khan", "Attila the Hun", "Tamerlane"],
          correctIndex: 0,
          explanation: "Genghis Khan founded and first Great Khan of the Mongol Empire, which grew into the largest contiguous land empire in history.",
          order: 5,
        },
      ],
    },
    {
      title: "Ultimate General Knowledge & Brainteasers",
      sourceType: "TOPIC" as const,
      sourceContent: "Trivia, Brainteasers, General Knowledge",
      difficulty: "hard",
      status: "PUBLISHED",
      timeLimitMinutes: 5,
      questions: [
        {
          text: "What is the only mammal capable of true, sustained flight?",
          options: ["Flying Squirrel", "Bat", "Sugar Glider", "Colugo"],
          correctIndex: 1,
          explanation: "Bats are the only mammals with wings capable of powered and sustained flight (flying squirrels only glide).",
          order: 1,
        },
        {
          text: "Which chemical element has the highest melting point of all metals?",
          options: ["Titanium", "Platinum", "Tungsten", "Osmium"],
          correctIndex: 2,
          explanation: "Tungsten (W) has the highest melting point of all metallic elements at 3,422 °C (6,192 °F).",
          order: 2,
        },
        {
          text: "How many keys are on a standard modern acoustic piano?",
          options: ["76", "84", "88", "92"],
          correctIndex: 2,
          explanation: "A standard full-size modern acoustic piano has 88 keys (52 white natural keys and 36 black accidentals).",
          order: 3,
        },
        {
          text: "What is the deepest known oceanic trench on Earth?",
          options: ["Puerto Rico Trench", "Java Trench", "Mariana Trench", "Tonga Trench"],
          correctIndex: 2,
          explanation: "The Mariana Trench in the western Pacific Ocean reaches a maximum known depth of approximately 10,994 meters (36,070 ft) at Challenger Deep.",
          order: 4,
        },
        {
          text: "Which artist painted 'The Starry Night' while staying at the Saint-Paul asylum in Saint-Rémy, France?",
          options: ["Claude Monet", "Vincent van Gogh", "Pablo Picasso", "Salvador Dalí"],
          correctIndex: 1,
          explanation: "Vincent van Gogh painted 'The Starry Night' in June 1889 from the east-facing window of his asylum room in Saint-Rémy-de-Provence.",
          order: 5,
        },
      ],
    },
  ];

  for (const quizData of starterQuizzes) {
    const existing = await prisma.quiz.findFirst({
      where: { title: quizData.title },
    });

    if (!existing) {
      const { questions, ...quizFields } = quizData;
      await prisma.quiz.create({
        data: {
          ...quizFields,
          isPublic: true,
          ownerId: creator.id,
          questions: {
            create: questions,
          },
        },
      });
    } else {
      await prisma.quiz.update({
        where: { id: existing.id },
        data: { isPublic: true },
      });
    }
  }

  console.log("Starter community quizzes seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
