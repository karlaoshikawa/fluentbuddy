import { CEFRLevel } from './types';

export interface LearningRequirement {
  id: string;
  category: 'vocabulary' | 'grammar' | 'verbs' | 'speaking' | 'writing' | 'pronunciation';
  name: string;
  description: string;
  examples?: string[];
  completed?: boolean;
}

export interface LevelRequirements {
  level: CEFRLevel;
  displayName: string;
  description: string;
  requirements: LearningRequirement[];
}

export const CEFR_LEVEL_REQUIREMENTS: Record<CEFRLevel, LevelRequirements> = {
  'A1': {
    level: 'A1',
    displayName: 'Beginner',
    description: 'Can understand and use familiar everyday expressions and basic phrases.',
    requirements: [
      // VOCABULARY
      {
        id: 'a1-vocab-numbers',
        category: 'vocabulary',
        name: 'Numbers 0-100',
        description: 'Learn to count and use numbers in daily situations',
        examples: ['one, two, three', 'ten, twenty, thirty', 'fifty dollars']
      },
      {
        id: 'a1-vocab-family',
        category: 'vocabulary',
        name: 'Family Members',
        description: 'Basic family vocabulary',
        examples: ['mother, father, sister, brother', 'grandmother, grandfather', 'aunt, uncle, cousin']
      },
      {
        id: 'a1-vocab-colors',
        category: 'vocabulary',
        name: 'Colors',
        description: 'Common colors',
        examples: ['red, blue, green, yellow', 'black, white, gray', 'pink, orange, purple']
      },
      {
        id: 'a1-vocab-days',
        category: 'vocabulary',
        name: 'Days of the Week',
        description: 'Days and basic time expressions',
        examples: ['Monday, Tuesday, Wednesday', 'today, tomorrow, yesterday']
      },
      {
        id: 'a1-vocab-food',
        category: 'vocabulary',
        name: 'Common Foods',
        description: 'Basic food and drink vocabulary',
        examples: ['bread, water, milk, apple', 'chicken, rice, egg', 'coffee, tea, juice']
      },
      {
        id: 'a1-vocab-places',
        category: 'vocabulary',
        name: 'Common Places',
        description: 'Places in the city',
        examples: ['home, school, hospital', 'restaurant, supermarket, bank', 'park, street, house']
      },
      
      // GRAMMAR
      {
        id: 'a1-grammar-to-be',
        category: 'grammar',
        name: 'Verb "to be" (Present)',
        description: 'I am, you are, he/she/it is, we/they are',
        examples: ['I am happy', 'She is a teacher', 'They are students']
      },
      {
        id: 'a1-grammar-articles',
        category: 'grammar',
        name: 'Articles (a, an, the)',
        description: 'Basic article usage',
        examples: ['a book, an apple', 'the dog, the car']
      },
      {
        id: 'a1-grammar-pronouns',
        category: 'grammar',
        name: 'Personal Pronouns',
        description: 'I, you, he, she, it, we, they',
        examples: ['I like coffee', 'He is tall', 'They are friends']
      },
      {
        id: 'a1-grammar-simple-present',
        category: 'grammar',
        name: 'Simple Present Tense',
        description: 'Basic present tense for routines',
        examples: ['I work every day', 'She likes music', 'We live in Brazil']
      },
      {
        id: 'a1-grammar-questions',
        category: 'grammar',
        name: 'Basic Questions (Wh-)',
        description: 'What, Where, Who, When',
        examples: ['What is your name?', 'Where are you from?', 'Who is she?']
      },
      
      // VERBS
      {
        id: 'a1-verbs-basic',
        category: 'verbs',
        name: 'Essential Verbs',
        description: '20 most common verbs',
        examples: ['be, have, do, go, come', 'eat, drink, sleep, work, live', 'like, want, need, see, know']
      },
      {
        id: 'a1-verbs-daily',
        category: 'verbs',
        name: 'Daily Routine Verbs',
        description: 'Verbs for daily activities',
        examples: ['wake up, get up, brush teeth', 'take a shower, get dressed', 'have breakfast, go to work']
      },
      
      // SPEAKING
      {
        id: 'a1-speaking-greetings',
        category: 'speaking',
        name: 'Greetings & Introductions',
        description: 'Basic greetings and self-introduction',
        examples: ['Hello, Hi, Good morning', 'My name is...', 'Nice to meet you']
      },
      {
        id: 'a1-speaking-requests',
        category: 'speaking',
        name: 'Simple Requests',
        description: 'Ask for basic things politely',
        examples: ['Can I have water, please?', 'Where is the bathroom?', 'How much is this?']
      },
      
      // WRITING
      {
        id: 'a1-writing-personal',
        category: 'writing',
        name: 'Personal Information',
        description: 'Write basic personal details',
        examples: ['My name is...', 'I am from...', 'I live in...']
      },
      {
        id: 'a1-writing-simple-sentences',
        category: 'writing',
        name: 'Simple Sentences',
        description: 'Write basic subject-verb-object sentences',
        examples: ['I like pizza', 'She works at home', 'We have a cat']
      },
      
      // PRONUNCIATION
      {
        id: 'a1-pronunciation-alphabet',
        category: 'pronunciation',
        name: 'English Alphabet',
        description: 'Pronounce all letters correctly',
        examples: ['A, B, C...', 'Vowel sounds: a, e, i, o, u']
      },
      {
        id: 'a1-pronunciation-basic-sounds',
        category: 'pronunciation',
        name: 'Basic Sounds',
        description: 'Common consonant and vowel sounds',
        examples: ['/θ/ - think', '/ð/ - this', '/ŋ/ - sing']
      }
    ]
  },

  'A2': {
    level: 'A2',
    displayName: 'Elementary',
    description: 'Can communicate in simple routine tasks requiring simple information exchange.',
    requirements: [
      // VOCABULARY
      {
        id: 'a2-vocab-emotions',
        category: 'vocabulary',
        name: 'Emotions & Feelings',
        description: 'Express how you feel',
        examples: ['happy, sad, angry, tired', 'excited, nervous, worried', 'surprised, confused, bored']
      },
      {
        id: 'a2-vocab-weather',
        category: 'vocabulary',
        name: 'Weather',
        description: 'Describe weather conditions',
        examples: ['sunny, rainy, cloudy, windy', 'hot, cold, warm, cool', "It's snowing, It's raining"]
      },
      {
        id: 'a2-vocab-clothes',
        category: 'vocabulary',
        name: 'Clothing',
        description: 'Common clothing items',
        examples: ['shirt, pants, dress, skirt', 'shoes, jacket, hat', 'wear, put on, take off']
      },
      {
        id: 'a2-vocab-hobbies',
        category: 'vocabulary',
        name: 'Hobbies & Activities',
        description: 'Free time activities',
        examples: ['play sports, watch movies, read books', 'listen to music, cook, dance', 'swim, run, paint']
      },
      {
        id: 'a2-vocab-travel',
        category: 'vocabulary',
        name: 'Travel & Transportation',
        description: 'Ways to travel and places',
        examples: ['bus, train, plane, car, taxi', 'airport, station, hotel', 'ticket, luggage, passport']
      },
      
      // GRAMMAR
      {
        id: 'a2-grammar-past-simple',
        category: 'grammar',
        name: 'Past Simple Tense',
        description: 'Regular and irregular past tense',
        examples: ['I worked yesterday', 'She went to the park', 'We had lunch at 1pm']
      },
      {
        id: 'a2-grammar-future',
        category: 'grammar',
        name: 'Future (going to)',
        description: 'Express future plans',
        examples: ["I'm going to travel", "She's going to study", 'They are going to visit us']
      },
      {
        id: 'a2-grammar-present-continuous',
        category: 'grammar',
        name: 'Present Continuous',
        description: 'Actions happening now',
        examples: ["I'm eating", "She's working", 'They are playing']
      },
      {
        id: 'a2-grammar-comparatives',
        category: 'grammar',
        name: 'Comparatives',
        description: 'Compare two things',
        examples: ['bigger, smaller, faster', 'more expensive, more beautiful', 'better, worse']
      },
      {
        id: 'a2-grammar-can-could',
        category: 'grammar',
        name: 'Modal Verbs (can, could)',
        description: 'Express ability and possibility',
        examples: ['I can swim', 'Could you help me?', 'She can speak English']
      },
      
      // VERBS
      {
        id: 'a2-verbs-irregular',
        category: 'verbs',
        name: 'Common Irregular Verbs',
        description: 'Past tense of irregular verbs',
        examples: ['go-went, see-saw, do-did', 'make-made, take-took, get-got', 'come-came, give-gave, think-thought']
      },
      {
        id: 'a2-verbs-phrasal-basic',
        category: 'verbs',
        name: 'Basic Phrasal Verbs',
        description: 'Common phrasal verbs',
        examples: ['wake up, get up, sit down', 'turn on/off, put on, take off', 'look at, look for']
      },
      
      // SPEAKING
      {
        id: 'a2-speaking-shopping',
        category: 'speaking',
        name: 'Shopping Situations',
        description: 'Buy things and ask prices',
        examples: ['How much does it cost?', 'Do you have this in blue?', 'Can I try this on?']
      },
      {
        id: 'a2-speaking-restaurant',
        category: 'speaking',
        name: 'At the Restaurant',
        description: 'Order food and drinks',
        examples: ['Can I see the menu?', 'I would like...', 'The check, please']
      },
      {
        id: 'a2-speaking-directions',
        category: 'speaking',
        name: 'Giving Directions',
        description: 'Ask for and give directions',
        examples: ['Go straight, turn left/right', 'Where is the...?', "It's next to..."]
      },
      
      // WRITING
      {
        id: 'a2-writing-messages',
        category: 'writing',
        name: 'Simple Messages',
        description: 'Write short notes and messages',
        examples: ['Text messages', 'Short emails', 'Postcards']
      },
      {
        id: 'a2-writing-paragraphs',
        category: 'writing',
        name: 'Short Paragraphs',
        description: 'Write connected sentences',
        examples: ['Describe your day', 'Talk about your family', 'Describe your home']
      },
      
      // PRONUNCIATION
      {
        id: 'a2-pronunciation-stress',
        category: 'pronunciation',
        name: 'Word Stress',
        description: 'Stress the correct syllable',
        examples: ['PHOto not phoTO', 'hoTEL not HOtel', 'comPUter']
      },
      {
        id: 'a2-pronunciation-ed-endings',
        category: 'pronunciation',
        name: '-ed Endings',
        description: 'Three pronunciations of -ed',
        examples: ['/t/ - worked, helped', '/d/ - played, opened', '/ɪd/ - wanted, needed']
      }
    ]
  },

  'B1': {
    level: 'B1',
    displayName: 'Intermediate',
    description: 'Can deal with most situations likely to arise whilst travelling.',
    requirements: [
      // VOCABULARY
      {
        id: 'b1-vocab-work',
        category: 'vocabulary',
        name: 'Work & Professions',
        description: 'Job-related vocabulary',
        examples: ['manager, engineer, accountant', 'interview, salary, promotion', 'colleague, boss, employee']
      },
      {
        id: 'b1-vocab-health',
        category: 'vocabulary',
        name: 'Health & Body',
        description: 'Medical and health vocabulary',
        examples: ['headache, fever, cough', 'doctor, medicine, hospital', 'healthy, sick, pain']
      },
      {
        id: 'b1-vocab-technology',
        category: 'vocabulary',
        name: 'Technology',
        description: 'Tech and digital vocabulary',
        examples: ['computer, smartphone, internet', 'download, upload, app', 'password, email, website']
      },
      {
        id: 'b1-vocab-education',
        category: 'vocabulary',
        name: 'Education',
        description: 'School and learning vocabulary',
        examples: ['university, degree, course', 'study, learn, teach', 'exam, homework, grade']
      },
      
      // GRAMMAR
      {
        id: 'b1-grammar-present-perfect',
        category: 'grammar',
        name: 'Present Perfect',
        description: 'Have/has + past participle',
        examples: ['I have visited Paris', "She's finished her work", 'Have you ever tried sushi?']
      },
      {
        id: 'b1-grammar-conditionals',
        category: 'grammar',
        name: 'First Conditional',
        description: 'If + present, will + verb',
        examples: ["If it rains, I'll stay home", "If you study, you'll pass", "What will you do if...?"]
      },
      {
        id: 'b1-grammar-past-continuous',
        category: 'grammar',
        name: 'Past Continuous',
        description: 'Was/were + -ing',
        examples: ['I was working at 9am', 'While I was cooking, he called', 'What were you doing?']
      },
      {
        id: 'b1-grammar-modals',
        category: 'grammar',
        name: 'Modal Verbs (should, must, might)',
        description: 'Express obligation, advice, possibility',
        examples: ['You should exercise', 'I must finish this', 'It might rain tomorrow']
      },
      {
        id: 'b1-grammar-passive',
        category: 'grammar',
        name: 'Passive Voice (Simple)',
        description: 'Be + past participle',
        examples: ['The book was written in 1960', 'English is spoken here', 'The house will be sold']
      },
      {
        id: 'b1-grammar-relative-clauses',
        category: 'grammar',
        name: 'Relative Clauses',
        description: 'Who, which, that, where',
        examples: ['The man who lives next door', 'The book that I read', 'The place where we met']
      },
      
      // VERBS
      {
        id: 'b1-verbs-phrasal-common',
        category: 'verbs',
        name: 'Common Phrasal Verbs',
        description: 'Frequently used phrasal verbs',
        examples: ['give up, carry on, find out', 'look after, put off, get on with', 'bring up, break down, run out of']
      },
      {
        id: 'b1-verbs-reporting',
        category: 'verbs',
        name: 'Reporting Verbs',
        description: 'Say, tell, ask, explain',
        examples: ['He said that...', 'She told me...', 'They asked if...', 'I explained that...']
      },
      
      // SPEAKING
      {
        id: 'b1-speaking-opinions',
        category: 'speaking',
        name: 'Expressing Opinions',
        description: 'Give and justify opinions',
        examples: ['I think that...', 'In my opinion...', 'I agree/disagree because...']
      },
      {
        id: 'b1-speaking-storytelling',
        category: 'speaking',
        name: 'Telling Stories',
        description: 'Narrate events and experiences',
        examples: ['First... then... finally...', 'Last week I went...', 'It was really interesting because...']
      },
      {
        id: 'b1-speaking-complaints',
        category: 'speaking',
        name: 'Making Complaints',
        description: 'Express dissatisfaction politely',
        examples: ["I'm afraid there's a problem", "I'd like to complain about...", 'This is not what I ordered']
      },
      
      // WRITING
      {
        id: 'b1-writing-emails',
        category: 'writing',
        name: 'Formal Emails',
        description: 'Write professional emails',
        examples: ['Dear Sir/Madam', 'I am writing to...', 'Best regards']
      },
      {
        id: 'b1-writing-essays',
        category: 'writing',
        name: 'Simple Essays',
        description: 'Write structured short essays',
        examples: ['Introduction, body, conclusion', 'Firstly, secondly, finally', 'In conclusion...']
      },
      {
        id: 'b1-writing-reviews',
        category: 'writing',
        name: 'Reviews',
        description: 'Write reviews of movies, restaurants, etc.',
        examples: ['Rate and describe', 'Pros and cons', 'Would recommend/not recommend']
      },
      
      // PRONUNCIATION
      {
        id: 'b1-pronunciation-intonation',
        category: 'pronunciation',
        name: 'Intonation Patterns',
        description: 'Rising and falling intonation',
        examples: ['Questions rise at the end', 'Statements fall', 'Lists have rising-falling pattern']
      },
      {
        id: 'b1-pronunciation-linking',
        category: 'pronunciation',
        name: 'Linking Sounds',
        description: 'Connect words smoothly',
        examples: ['an apple = /ənæpəl/', 'turn off = /tɜrnɔf/', 'at all = /ətɔl/']
      }
    ]
  },

  'B2': {
    level: 'B2',
    displayName: 'Upper Intermediate',
    description: 'Can interact with fluency and spontaneity with native speakers.',
    requirements: [
      // VOCABULARY
      {
        id: 'b2-vocab-abstract',
        category: 'vocabulary',
        name: 'Abstract Concepts',
        description: 'Ideas, theories, concepts',
        examples: ['freedom, justice, equality', 'philosophy, theory, hypothesis', 'ethics, morality, principles']
      },
      {
        id: 'b2-vocab-idioms',
        category: 'vocabulary',
        name: 'Common Idioms',
        description: 'Frequently used expressions',
        examples: ['piece of cake, break the ice', 'hit the books, cost an arm and a leg', 'once in a blue moon']
      },
      {
        id: 'b2-vocab-collocations',
        category: 'vocabulary',
        name: 'Word Collocations',
        description: 'Words that go together',
        examples: ['make a decision, do homework', 'take a break, catch a cold', 'heavy rain, strong wind']
      },
      {
        id: 'b2-vocab-business',
        category: 'vocabulary',
        name: 'Business English',
        description: 'Professional and business terms',
        examples: ['meeting, deadline, agenda', 'profit, revenue, investment', 'negotiate, collaborate, implement']
      },
      
      // GRAMMAR
      {
        id: 'b2-grammar-perfect-continuous',
        category: 'grammar',
        name: 'Perfect Continuous Tenses',
        description: 'Have been + -ing',
        examples: ["I've been working here for 5 years", "She'd been waiting for hours", 'How long have you been studying?']
      },
      {
        id: 'b2-grammar-conditionals-2-3',
        category: 'grammar',
        name: 'Second & Third Conditionals',
        description: 'Hypothetical and past hypothetical',
        examples: ['If I were rich, I would travel', 'If I had known, I would have come', 'I wish I had studied more']
      },
      {
        id: 'b2-grammar-reported-speech',
        category: 'grammar',
        name: 'Reported Speech',
        description: 'Report what others said',
        examples: ['He said he was tired', 'She told me she had finished', 'They asked if I could help']
      },
      {
        id: 'b2-grammar-passive-advanced',
        category: 'grammar',
        name: 'Advanced Passive Forms',
        description: 'Complex passive structures',
        examples: ['It is believed that...', 'He is said to be...', 'The work is being done']
      },
      {
        id: 'b2-grammar-wish-clauses',
        category: 'grammar',
        name: 'Wish/If only Clauses',
        description: 'Express regrets and desires',
        examples: ['I wish I could fly', 'If only I had more time', 'I wish I had studied harder']
      },
      
      // VERBS
      {
        id: 'b2-verbs-phrasal-advanced',
        category: 'verbs',
        name: 'Advanced Phrasal Verbs',
        description: 'Less common phrasal verbs',
        examples: ['come up with, get away with', 'put up with, look down on', 'stand up for, cut down on']
      },
      {
        id: 'b2-verbs-dependent-prepositions',
        category: 'verbs',
        name: 'Verbs + Dependent Prepositions',
        description: 'Verbs that need specific prepositions',
        examples: ['depend on, apologize for', 'succeed in, insist on', 'believe in, care about']
      },
      
      // SPEAKING
      {
        id: 'b2-speaking-debates',
        category: 'speaking',
        name: 'Debates & Discussions',
        description: 'Argue a point of view',
        examples: ['On the one hand... on the other hand', 'However, I would argue that...', 'The evidence suggests...']
      },
      {
        id: 'b2-speaking-presentations',
        category: 'speaking',
        name: 'Presentations',
        description: 'Deliver structured presentations',
        examples: ["Today I'll be talking about...", 'Let me illustrate this with...', 'To sum up...']
      },
      {
        id: 'b2-speaking-negotiations',
        category: 'speaking',
        name: 'Negotiations',
        description: 'Negotiate and persuade',
        examples: ['What if we...?', 'Would you consider...?', 'I propose that we...']
      },
      
      // WRITING
      {
        id: 'b2-writing-reports',
        category: 'writing',
        name: 'Reports',
        description: 'Write formal reports',
        examples: ['Executive summary', 'Findings and analysis', 'Recommendations']
      },
      {
        id: 'b2-writing-articles',
        category: 'writing',
        name: 'Articles',
        description: 'Write articles for publication',
        examples: ['Engaging headline', 'Hook the reader', 'Clear structure with subheadings']
      },
      {
        id: 'b2-writing-argumentative',
        category: 'writing',
        name: 'Argumentative Essays',
        description: 'Present and support arguments',
        examples: ['Thesis statement', 'Supporting evidence', 'Counter-arguments']
      },
      
      // PRONUNCIATION
      {
        id: 'b2-pronunciation-weak-forms',
        category: 'pronunciation',
        name: 'Weak Forms',
        description: 'Unstressed pronunciation of function words',
        examples: ['can /kən/ vs /kæn/', 'of /əv/', 'for /fər/']
      },
      {
        id: 'b2-pronunciation-sentence-stress',
        category: 'pronunciation',
        name: 'Sentence Stress',
        description: 'Stress content words for meaning',
        examples: ['I DIDN\'T say he stole it', 'I didn\'t SAY he stole it', 'I didn\'t say HE stole it']
      }
    ]
  },

  'C1': {
    level: 'C1',
    displayName: 'Advanced',
    description: 'Can express ideas fluently and spontaneously without much obvious searching.',
    requirements: [
      // VOCABULARY
      {
        id: 'c1-vocab-academic',
        category: 'vocabulary',
        name: 'Academic Vocabulary',
        description: 'Formal and academic terms',
        examples: ['analyze, synthesize, evaluate', 'methodology, paradigm, discourse', 'implication, inference, assumption']
      },
      {
        id: 'c1-vocab-nuanced',
        category: 'vocabulary',
        name: 'Nuanced Vocabulary',
        description: 'Subtle differences in meaning',
        examples: ['walk vs stroll vs march', 'look vs glance vs stare', 'say vs mention vs declare']
      },
      {
        id: 'c1-vocab-formal-informal',
        category: 'vocabulary',
        name: 'Register Variation',
        description: 'Formal vs informal language',
        examples: ['purchase vs buy', 'commence vs start', 'reside vs live']
      },
      {
        id: 'c1-vocab-metaphors',
        category: 'vocabulary',
        name: 'Metaphors & Figurative Language',
        description: 'Non-literal expressions',
        examples: ['Time is money', 'The project gained momentum', 'She was walking on air']
      },
      
      // GRAMMAR
      {
        id: 'c1-grammar-inversion',
        category: 'grammar',
        name: 'Inversion',
        description: 'Formal inverted structures',
        examples: ['Never have I seen such beauty', 'Rarely does he complain', 'Only then did I realize']
      },
      {
        id: 'c1-grammar-cleft-sentences',
        category: 'grammar',
        name: 'Cleft Sentences',
        description: 'It/What for emphasis',
        examples: ['What I need is a vacation', "It's Mary who called", 'What matters is the result']
      },
      {
        id: 'c1-grammar-subjunctive',
        category: 'grammar',
        name: 'Subjunctive Mood',
        description: 'Formal suggestions and requirements',
        examples: ['I suggest that he be promoted', 'It is essential that she attend', 'They demanded that it be done']
      },
      {
        id: 'c1-grammar-participle-clauses',
        category: 'grammar',
        name: 'Participle Clauses',
        description: 'Reduce relative clauses',
        examples: ['Having finished the work, he left', 'Being tired, she went to bed', 'The man standing there is my boss']
      },
      {
        id: 'c1-grammar-advanced-conditionals',
        category: 'grammar',
        name: 'Mixed Conditionals',
        description: 'Mixed time references',
        examples: ['If I had studied, I would be rich now', 'If I were smarter, I would have passed']
      },
      
      // VERBS
      {
        id: 'c1-verbs-collocations',
        category: 'verbs',
        name: 'Advanced Verb Collocations',
        description: 'Natural verb combinations',
        examples: ['pose a question, harbor doubts', 'wield influence, exert pressure', 'undergo surgery, sustain injuries']
      },
      {
        id: 'c1-verbs-multi-word',
        category: 'verbs',
        name: 'Complex Multi-word Verbs',
        description: 'Three-word phrasal verbs',
        examples: ['look forward to, put up with', 'run out of, get along with', 'come up with, keep up with']
      },
      
      // SPEAKING
      {
        id: 'c1-speaking-academic',
        category: 'speaking',
        name: 'Academic Discourse',
        description: 'Discuss complex academic topics',
        examples: ['Elaborate on theories', 'Critique methodologies', 'Synthesize information']
      },
      {
        id: 'c1-speaking-persuasion',
        category: 'speaking',
        name: 'Advanced Persuasion',
        description: 'Sophisticated argumentation',
        examples: ['Rhetorical devices', 'Logical fallacies to avoid', 'Building consensus']
      },
      {
        id: 'c1-speaking-diplomacy',
        category: 'speaking',
        name: 'Diplomatic Language',
        description: 'Tactful and indirect communication',
        examples: ['With all due respect...', 'I wonder if we might consider...', 'It could be argued that...']
      },
      
      // WRITING
      {
        id: 'c1-writing-research',
        category: 'writing',
        name: 'Research Papers',
        description: 'Academic writing with citations',
        examples: ['Literature review', 'Methodology section', 'Discussion of findings']
      },
      {
        id: 'c1-writing-proposals',
        category: 'writing',
        name: 'Professional Proposals',
        description: 'Business proposals and bids',
        examples: ['Executive summary', 'Cost-benefit analysis', 'Implementation timeline']
      },
      {
        id: 'c1-writing-critique',
        category: 'writing',
        name: 'Critical Analysis',
        description: 'Analyze and evaluate texts',
        examples: ['Identify assumptions', 'Evaluate arguments', 'Compare perspectives']
      },
      
      // PRONUNCIATION
      {
        id: 'c1-pronunciation-connected-speech',
        category: 'pronunciation',
        name: 'Connected Speech Features',
        description: 'Natural speech patterns',
        examples: ['Assimilation: ten pounds → /tem paʊndz/', 'Elision: next day → /neks deɪ/', 'Intrusion: go away → /gəʊw əˈweɪ/']
      },
      {
        id: 'c1-pronunciation-discourse',
        category: 'pronunciation',
        name: 'Discourse Markers',
        description: 'Pronunciation of discourse markers',
        examples: ['Well, you know, I mean', 'So, anyway, basically', 'Actually, in fact']
      }
    ]
  },

  'C2': {
    level: 'C2',
    displayName: 'Proficiency',
    description: 'Can understand with ease virtually everything heard or read.',
    requirements: [
      // VOCABULARY
      {
        id: 'c2-vocab-specialized',
        category: 'vocabulary',
        name: 'Specialized Terminology',
        description: 'Field-specific vocabulary',
        examples: ['Legal jargon', 'Medical terminology', 'Technical specifications']
      },
      {
        id: 'c2-vocab-rare-words',
        category: 'vocabulary',
        name: 'Rare & Literary Words',
        description: 'Uncommon vocabulary',
        examples: ['serendipity, epiphany', 'ubiquitous, quintessential', 'juxtapose, dichotomy']
      },
      {
        id: 'c2-vocab-etymology',
        category: 'vocabulary',
        name: 'Word Origins & Etymology',
        description: 'Understanding word roots',
        examples: ['Greek/Latin roots', 'Word formation processes', 'Historical development']
      },
      
      // GRAMMAR
      {
        id: 'c2-grammar-all-mastery',
        category: 'grammar',
        name: 'Complete Grammar Mastery',
        description: 'All grammatical structures',
        examples: ['Rare structures', 'Archaic forms', 'Stylistic variations']
      },
      {
        id: 'c2-grammar-stylistic',
        category: 'grammar',
        name: 'Stylistic Grammar Choices',
        description: 'Grammar for effect',
        examples: ['Fronting for emphasis', 'Ellipsis for brevity', 'Parenthetical insertions']
      },
      
      // VERBS
      {
        id: 'c2-verbs-mastery',
        category: 'verbs',
        name: 'Complete Verb Mastery',
        description: 'All verb forms and uses',
        examples: ['All tenses including archaic', 'All modal nuances', 'All phrasal verbs']
      },
      
      // SPEAKING
      {
        id: 'c2-speaking-native-like',
        category: 'speaking',
        name: 'Native-like Fluency',
        description: 'Speak like a native speaker',
        examples: ['Natural rhythm and flow', 'Cultural references', 'Humor and wordplay']
      },
      {
        id: 'c2-speaking-public',
        category: 'speaking',
        name: 'Public Speaking',
        description: 'Deliver speeches and lectures',
        examples: ['Engage large audiences', 'Handle questions confidently', 'Use rhetorical techniques']
      },
      {
        id: 'c2-speaking-interpretation',
        category: 'speaking',
        name: 'Interpretation & Mediation',
        description: 'Translate and mediate discussions',
        examples: ['Simultaneous interpretation', 'Summarize complex discussions', 'Bridge cultural gaps']
      },
      
      // WRITING
      {
        id: 'c2-writing-creative',
        category: 'writing',
        name: 'Creative Writing',
        description: 'Fiction, poetry, creative nonfiction',
        examples: ['Literary devices', 'Voice and style', 'Narrative techniques']
      },
      {
        id: 'c2-writing-professional',
        category: 'writing',
        name: 'Professional Writing',
        description: 'All professional documents',
        examples: ['White papers', 'Policy documents', 'Strategic plans']
      },
      {
        id: 'c2-writing-style',
        category: 'writing',
        name: 'Mastery of Style',
        description: 'Adapt style to purpose',
        examples: ['Academic style', 'Journalistic style', 'Literary style']
      },
      
      // PRONUNCIATION
      {
        id: 'c2-pronunciation-accents',
        category: 'pronunciation',
        name: 'Accent Awareness',
        description: 'Understand all major accents',
        examples: ['British, American, Australian', 'Regional variations', 'Accent modification']
      },
      {
        id: 'c2-pronunciation-perfect',
        category: 'pronunciation',
        name: 'Near-Perfect Pronunciation',
        description: 'Minimal accent interference',
        examples: ['All sounds produced accurately', 'Natural prosody', 'Appropriate intonation']
      }
    ]
  }
};

// Helper functions
export function getRequirementsByCategory(level: CEFRLevel, category: LearningRequirement['category']) {
  return CEFR_LEVEL_REQUIREMENTS[level].requirements.filter(req => req.category === category);
}

export function getTotalRequirements(level: CEFRLevel): number {
  return CEFR_LEVEL_REQUIREMENTS[level].requirements.length;
}

export function getCompletedRequirements(level: CEFRLevel): number {
  return CEFR_LEVEL_REQUIREMENTS[level].requirements.filter(req => req.completed).length;
}

export function getProgressPercentage(level: CEFRLevel): number {
  const total = getTotalRequirements(level);
  const completed = getCompletedRequirements(level);
  return Math.round((completed / total) * 100);
}

export function getNextIncompleteRequirement(level: CEFRLevel): LearningRequirement | null {
  return CEFR_LEVEL_REQUIREMENTS[level].requirements.find(req => !req.completed) || null;
}

// Category display names
export const CATEGORY_NAMES = {
  vocabulary: 'Vocabulário',
  grammar: 'Gramática',
  verbs: 'Verbos',
  speaking: 'Conversação',
  writing: 'Escrita',
  pronunciation: 'Pronúncia'
};
