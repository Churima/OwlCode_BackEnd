import admin from './src/firebase/firebase-admin';

const seed = async () => {
  const db = admin.firestore();

  const linguagens = [
    {
      nome: 'JavaScript',
      cor: '#f7df1e',
      url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
    },
    {
      nome: 'Python',
      cor: '#3572A5',
      url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
    },
    {
      nome: 'Java',
      cor: '#b07219',
      url: 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg',
    },
    {
      nome: 'C#',
      cor: '#178600',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png',
    },
    {
      nome: 'C++',
      cor: '#f34b7d',
      url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg',
    },
    {
      nome: 'Go',
      cor: '#00ADD8',
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg',
    },
    {
      nome: 'Ruby',
      cor: '#701516',
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg',
    },
    {
      nome: 'TypeScript',
      cor: '#3178C6',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg',
    },
    {
      nome: 'PHP',
      cor: '#8892be',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg',
    },
    {
      nome: 'Kotlin',
      cor: '#A97BFF',
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png',
    },
  ];

  for (const lang of linguagens) {
    const docRef = await db.collection('linguagens').add(lang);
    console.log(`Adicionado: ${lang.nome} (ID: ${docRef.id})`);
  }

  process.exit();
};

seed();