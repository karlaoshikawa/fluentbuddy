
import { TeacherPersona, CEFRLevel } from './types';

// Configurações de Áudio e VAD
export const AUDIO_CONFIG = {
  ENABLE_VAD: true, // Voice Activity Detection - desabilitar se reconhecimento estiver comprometido
  VAD_ENERGY_THRESHOLD: 0.008, // Threshold de energia (menor = mais sensível)
  VAD_SILENCE_FRAMES: 20, // Frames de silêncio tolerados (maior = tolera pausas maiores)
  VAD_VOICE_FRAMES: 1, // Frames com voz para começar a enviar (menor = mais responsivo)
  NOISE_GATE_THRESHOLD: 0.005, // Threshold do noise gate (menor = menos agressivo)
};

export const TEACHER_PERSONAS: TeacherPersona[] = [
  {
    id: 'alex',
    name: 'Alex',
    voice: 'Puck',
    accent: 'American',
    description: 'Energetic and friendly, great for casual conversation and daily topics.always pushing to use new vocabulary.'
  },
  {
    id: 'sarah',
    name: 'Sarah',
    voice: 'Kore',
    accent: 'American (Formal)',
    description: 'Patient and clear, focuses on formal grammar and sophisticated vocabulary.'
  },
  {
    id: 'james',
    name: 'James',
    voice: 'Fenrir',
    accent: 'American (Corporate)',
    description: 'Tech Management Coach. Focuses on leadership, business communication, and career growth in global companies.'
  }
];

export const SYSTEM_INSTRUCTION = (persona: TeacherPersona, userLevel: CEFRLevel = 'B1', learningContext?: string) => `
You are ${persona.name}, a professional and enthusiastic English teacher. Your mission is to help the student SPEAK and WRITE confidently.
Current Student Level: ${userLevel} (CEFR Scale).

${learningContext ? `\n${learningContext}\n` : ''}

**CRITICAL RULES**:
1. **ALWAYS adapt to the student's ACTUAL level** - If they demonstrate B2/C1 skills, don't treat them like A1!
2. **PRIMARY FOCUS**: Make them FORM SENTENCES, EXPRESS IDEAS, and CONSTRUCT ARGUMENTS (80% of the time)
3. **NEVER give basic exercises** (like counting 1-10) unless the student is genuinely A1 level
4. **ALWAYS encourage and challenge** - Push them to the next level with positive reinforcement
5. **GRAMMAR CORRECTION IS MANDATORY**: Always point out grammar mistakes and suggest more natural/fluent alternatives

Your teaching method:
- **Start each session asking**: "What would you like to practice today?" or "Tell me about something interesting that happened recently"
- **Ask open-ended questions** that require complete sentences and explanations
- **Follow up with "Why?"** - Make them justify their opinions and elaborate
- **Real-world scenarios**: "How would you explain this to your manager?" or "Describe a solution to this problem"
- **Sentence construction focus**: "Can you rephrase that using different words?" or "Try expressing the same idea in another way"
- **Vocabulary expansion**: When they use a word, ask them to use it in another different sentence
- **ALWAYS correct grammar mistakes**: After each student response, if there are grammar errors, point them out kindly and show the correct form
- **Suggest natural alternatives**: Even if grammatically correct, suggest more natural or fluent ways to express the same idea when relevant
  Example: "Good! Your sentence is correct, but natives usually say '[more natural version]' - sounds more fluent!"

${persona.id === 'james' ? 
  `Your role: Executive Business Coach for tech professionals.
   
   **Level Adaptation**:
   - A1-A2: Basic professional scenarios (meetings, emails, introductions) - but ONLY if truly needed
   - B1-B2: Business discussions (project updates, team feedback, decision-making) ✓ MOST COMMON
   - C1-C2: Strategic thinking (vision, leadership, complex stakeholder management)
   
   **Your approach**:
   - Challenge them with realistic work situations that require explanation
   - "Imagine you need to convince the CEO..." 
   - "How would you present this strategy to stakeholders?"
   - "Explain why this technical decision matters for business"
   - Always acknowledge good answers: "Excellent point!", "That's a strong argument!", "Great way to phrase that!"
   - When they struggle: "You're on the right track! Try breaking it down into steps"` : 
  `Your approach:
   - Give situations where they must explain, describe, or argue
   - "Tell me your opinion about..." 
   - "Describe how you would..."
   - "What do you think about... and why?"
   - Celebrate progress: "Much better!", "I love how you phrased that!", "You're improving fast!"
   - Encourage attempts: "Good try! Let's refine that together"`}

- Accent: ${persona.accent}.
- **Be VERY encouraging**: Praise specific improvements, celebrate attempts, build confidence
- **Correct naturally**: "Great sentence! In English, we usually say... Can you try it again?"
- **Grammar feedback format**: 
  • If there's a mistake: "Good try! Just a small correction: [corrected version]. Can you say it again?"
  • If correct but unnatural: "Perfect grammar! Though natives often say '[more natural version]' - sounds more fluent!"
  • Always explain WHY: "We use 'have been' here because it's an action that started in the past and continues now"
- If Portuguese is used: "I understand! Now let's express that in English - you can do it!"
- **NEVER lecture** - Turn everything into a speaking/writing opportunity

Examples of EXCELLENT prompts:
✅ "Explain to me why you chose your career"
✅ "Describe a challenge you faced and how you solved it"
✅ "What's your opinion on remote work? Give me 3 reasons"
✅ "How would you convince someone to try something new?"
✅ "Tell me about your goals for this year"

Examples to AVOID:
❌ "Let's count from 1 to 10" (too basic for B1+)
❌ "Repeat after me" (passive learning)
❌ Just explaining grammar rules (make them use it instead!)

**Remember**: ADAPT to their demonstrated level, CHALLENGE appropriately, ENCOURAGE constantly!
`;

export const ASSESSMENT_PROMPT = (history: string) => `
Analyze the following English conversation history between a student (User) and a teacher.
History:
${history}

Evaluate the User's English level based on CEFR standards (A1 to C2) and provide scores (0-100) for three categories.
Consider:
1. Grammar: Accuracy and complexity of structures.
2. Vocabulary: Range and appropriateness (especially business/management context).
3. Communication: Fluency, coherence, and ability to convey leadership ideas.

Return ONLY a JSON object:
{
  "grammar": number,
  "vocabulary": number,
  "communication": number,
  "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "reasoning": "Brief one sentence explanation of the level"
}
`;

export const ANALYSIS_PROMPT = (sentence: string) => `
Analyze the following English sentence for a student learning English. 
Sentence: "${sentence}"
Return ONLY a JSON object:
{
  "sentence": string,
  "tips": [{"word": string, "ipa": string, "tip": string, "difficulty": "easy|medium|hard"}],
  "overallAdvice": string
}
`;

// ===== Textos Progressivos para Exercícios de Escrita =====
import { WritingText } from './types';

export const WRITING_TEXTS: WritingText[] = [
  // A1 Level
  {
    id: 'a1-1',
    level: 'A1',
    difficulty: 1,
    title: 'My Name',
    text: 'Hello! My name is Sarah. I am from London. I am a teacher. I like coffee and books. I have a cat. My cat is black and white.',
    wordCount: 29,
    topics: ['introduction', 'personal info', 'likes'],
    keyVocabulary: ['name', 'from', 'teacher', 'like', 'have', 'cat'],
    comprehensionQuestions: [
      'What is her name?',
      'Where is she from?',
      'What is her job?',
      'Does she have a pet?'
    ]
  },
  {
    id: 'a1-2',
    level: 'A1',
    difficulty: 2,
    title: 'My Daily Routine',
    text: 'I wake up at 7 AM every day. I eat breakfast at 7:30. I go to work at 8 AM. I work from 9 AM to 5 PM. I come home at 6 PM. I cook dinner and watch TV. I go to bed at 10 PM.',
    wordCount: 50,
    topics: ['routine', 'time', 'daily activities'],
    keyVocabulary: ['wake up', 'breakfast', 'work', 'come home', 'dinner', 'go to bed'],
    comprehensionQuestions: [
      'What time does the person wake up?',
      'When do they go to work?',
      'What do they do after coming home?'
    ]
  },

  // A2 Level
  {
    id: 'a2-1',
    level: 'A2',
    difficulty: 3,
    title: 'Weekend Plans',
    text: 'This weekend I am going to visit my grandmother. She lives in a small town near the beach. On Saturday morning, I will drive there with my sister. We are planning to have lunch together and walk on the beach. On Sunday, we will help her with her garden. I always enjoy spending time with her because she tells interesting stories about her life.',
    wordCount: 67,
    topics: ['family', 'plans', 'activities', 'future tense'],
    keyVocabulary: ['weekend', 'visit', 'planning', 'drive', 'spend time', 'enjoy'],
    comprehensionQuestions: [
      'Who will the person visit?',
      'Where does the grandmother live?',
      'What will they do on Sunday?',
      'Why does the person enjoy visiting?'
    ]
  },
  {
    id: 'a2-2',
    level: 'A2',
    difficulty: 4,
    title: 'Learning English',
    text: 'I started learning English two years ago. At first, it was very difficult for me. I could not understand native speakers and I made many mistakes. But I practiced every day. I watched movies with subtitles, listened to podcasts, and talked with friends online. Now I can have simple conversations and understand most of what people say. I still need to improve my grammar and vocabulary, but I am making progress.',
    wordCount: 75,
    topics: ['learning', 'experience', 'progress', 'past tense'],
    keyVocabulary: ['started', 'difficult', 'practiced', 'improve', 'progress', 'mistakes'],
    comprehensionQuestions: [
      'When did the person start learning English?',
      'What was difficult at first?',
      'What methods did they use to practice?',
      'What can they do now?'
    ]
  },

  // B1 Level
  {
    id: 'b1-1',
    level: 'B1',
    difficulty: 5,
    title: 'Remote Work Experience',
    text: 'Since the pandemic started, I have been working from home. At first, I thought it would be wonderful to avoid the daily commute and have more flexibility. However, I quickly discovered both advantages and disadvantages. On one hand, I save time and money on transportation, and I can organize my schedule more freely. On the other hand, I sometimes feel isolated and miss the social interaction with colleagues. The boundary between work and personal life has become blurred, making it harder to disconnect after work hours. Despite these challenges, I believe remote work will continue to be popular because it offers benefits that many employees value.',
    wordCount: 112,
    topics: ['work', 'pandemic', 'advantages and disadvantages', 'opinion'],
    keyVocabulary: ['remote work', 'commute', 'flexibility', 'isolated', 'boundary', 'disconnect'],
    comprehensionQuestions: [
      'How did the person feel about remote work initially?',
      'What are the advantages mentioned?',
      'What are the disadvantages?',
      'What is the conclusion about remote work?'
    ]
  },
  {
    id: 'b1-2',
    level: 'B1',
    difficulty: 6,
    title: 'A Memorable Trip',
    text: 'Last summer, I took a trip that changed my perspective on life. I traveled alone to Japan for three weeks. Although I was nervous about visiting a country where I didn\'t speak the language, I was determined to challenge myself. The experience taught me valuable lessons. I learned to be more independent and confident in unfamiliar situations. I discovered that most people are kind and willing to help, even when there is a language barrier. The trip also made me appreciate different cultures and ways of thinking. When I returned home, I felt more open-minded and grateful for the opportunity to explore the world.',
    wordCount: 111,
    topics: ['travel', 'personal growth', 'experience', 'past tense'],
    keyVocabulary: ['perspective', 'determined', 'challenge', 'unfamiliar', 'appreciate', 'open-minded'],
    comprehensionQuestions: [
      'Where did the person travel?',
      'Why were they nervous?',
      'What lessons did they learn?',
      'How did they feel after returning?'
    ]
  },

  // B2 Level
  {
    id: 'b2-1',
    level: 'B2',
    difficulty: 7,
    title: 'The Impact of Social Media',
    text: 'Social media has revolutionized the way we communicate and share information. Platforms like Facebook, Instagram, and Twitter have connected billions of people worldwide, enabling instant communication across vast distances. While these tools have undeniably brought people closer together, they have also raised concerns about privacy, mental health, and the spread of misinformation. Studies suggest that excessive social media use can lead to anxiety, depression, and decreased self-esteem, particularly among young people who compare themselves to idealized online personas. Furthermore, the algorithms that govern these platforms often create echo chambers, where users are primarily exposed to content that reinforces their existing beliefs. Despite these drawbacks, social media remains an integral part of modern life, and learning to use it responsibly is essential.',
    wordCount: 131,
    topics: ['technology', 'society', 'advantages and disadvantages', 'analysis'],
    keyVocabulary: ['revolutionized', 'enabling', 'undeniably', 'misinformation', 'excessive', 'echo chambers'],
    comprehensionQuestions: [
      'How has social media changed communication?',
      'What concerns have been raised?',
      'What do studies suggest about excessive use?',
      'What are echo chambers?'
    ]
  },
  {
    id: 'b2-2',
    level: 'B2',
    difficulty: 8,
    title: 'Career Development in Tech',
    text: 'Building a successful career in the technology industry requires more than just technical skills. While proficiency in programming languages and frameworks is fundamental, professionals must also develop strong communication abilities, leadership qualities, and business acumen. The ability to collaborate effectively with cross-functional teams, present ideas clearly to stakeholders, and understand the commercial implications of technical decisions can distinguish outstanding engineers from merely competent ones. Moreover, the rapid pace of technological change demands continuous learning and adaptability. Engineers who invest time in expanding their skill set, staying current with industry trends, and cultivating a growth mindset are more likely to advance in their careers and take on leadership roles. Ultimately, success in tech is about combining technical excellence with strategic thinking and interpersonal skills.',
    wordCount: 133,
    topics: ['career', 'technology', 'professional development', 'skills'],
    keyVocabulary: ['proficiency', 'acumen', 'stakeholders', 'implications', 'distinguish', 'cultivating'],
    comprehensionQuestions: [
      'What is required for a successful tech career?',
      'What distinguishes outstanding engineers?',
      'Why is continuous learning important?',
      'What combination leads to success?'
    ]
  },

  // C1 Level
  {
    id: 'c1-1',
    level: 'C1',
    difficulty: 9,
    title: 'Leadership in Uncertain Times',
    text: 'Effective leadership during periods of uncertainty requires a delicate balance between decisiveness and flexibility. Leaders must project confidence and provide clear direction while simultaneously remaining open to new information and willing to adjust their strategies. This paradox is particularly challenging in today\'s volatile business environment, where market conditions can shift rapidly and unexpected crises can emerge without warning. The most successful leaders cultivate what organizational psychologists call "adaptive capacity" – the ability to maintain stability while navigating change. This involves creating psychological safety within teams, encouraging diverse perspectives, and fostering a culture where intelligent risk-taking is valued. Furthermore, effective leaders recognize that uncertainty is not merely a challenge to be overcome but an opportunity for innovation and growth. By reframing ambiguity as a catalyst for creative problem-solving, they can inspire their teams to discover novel solutions and competitive advantages.',
    wordCount: 148,
    topics: ['leadership', 'business', 'strategy', 'organizational psychology'],
    keyVocabulary: ['decisiveness', 'paradox', 'volatile', 'adaptive capacity', 'psychological safety', 'ambiguity'],
    comprehensionQuestions: [
      'What balance must leaders maintain?',
      'What is "adaptive capacity"?',
      'How should leaders view uncertainty?',
      'What does creating psychological safety involve?'
    ]
  },
  {
    id: 'c1-2',
    level: 'C1',
    difficulty: 10,
    title: 'The Ethics of Artificial Intelligence',
    text: 'As artificial intelligence systems become increasingly sophisticated and integrated into critical decision-making processes, society faces profound ethical questions about autonomy, accountability, and bias. Machine learning algorithms, trained on historical data, often perpetuate and amplify existing societal prejudices, leading to discriminatory outcomes in areas such as hiring, lending, and criminal justice. The opacity of many AI systems – often described as "black boxes" – makes it difficult to understand how decisions are reached, raising concerns about transparency and the ability to challenge potentially unfair determinations. Moreover, the delegation of consequential decisions to automated systems raises questions about moral responsibility when things go wrong. Should liability rest with the developers who created the algorithm, the organizations that deployed it, or the AI system itself? Addressing these challenges requires not only technical solutions, such as explainable AI and bias mitigation techniques, but also robust regulatory frameworks and ongoing public dialogue about the values we want our technologies to embody.',
    wordCount: 167,
    topics: ['artificial intelligence', 'ethics', 'society', 'technology'],
    keyVocabulary: ['sophisticated', 'perpetuate', 'opacity', 'transparency', 'consequential', 'liability', 'embody'],
    comprehensionQuestions: [
      'What ethical questions does AI raise?',
      'How can algorithms perpetuate bias?',
      'What is meant by "black boxes"?',
      'What is needed to address these challenges?'
    ]
  },

  // Mini Histórias - A1 Level
  {
    id: 'story-a1-1',
    level: 'A1',
    difficulty: 2,
    title: 'The Lost Dog',
    text: 'Yesterday I saw a small dog in the park. The dog was alone and looked sad. I walked to the dog and read his collar. His name was Max. The collar had a phone number. I called the number and talked to the owner. The owner was very happy. She came to the park quickly and hugged Max. She thanked me many times. Max was happy again.',
    wordCount: 69,
    topics: ['story', 'animals', 'helping', 'past tense'],
    keyVocabulary: ['saw', 'alone', 'collar', 'owner', 'called', 'thanked'],
    comprehensionQuestions: [
      'Where did the person see the dog?',
      'How did they find the owner?',
      'How did the owner feel?'
    ]
  },

  // Mini Histórias - A2 Level
  {
    id: 'story-a2-1',
    level: 'A2',
    difficulty: 4,
    title: 'The Coffee Shop Surprise',
    text: 'Last Tuesday, I went to my favorite coffee shop as usual. I ordered my regular coffee and sat down to read. A few minutes later, the barista brought my coffee with a beautiful latte art heart on top. When I looked at the cup, I noticed something written on it: "Have a wonderful day!" This small gesture made me smile. I realized that sometimes the smallest acts of kindness can change our entire day. Since then, I always try to do something nice for someone else.',
    wordCount: 90,
    topics: ['story', 'kindness', 'daily life', 'surprise'],
    keyVocabulary: ['as usual', 'regular', 'noticed', 'gesture', 'realized', 'acts of kindness'],
    comprehensionQuestions: [
      'What did the person order?',
      'What was special about the coffee?',
      'How did this experience change the person?'
    ]
  },

  // Mini Histórias - B1 Level
  {
    id: 'story-b1-1',
    level: 'B1',
    difficulty: 6,
    title: 'The Job Interview',
    text: 'I will never forget my first job interview in English. I had prepared for weeks, practicing common questions and rehearsing my answers in front of the mirror. When the day arrived, I felt nervous but confident. The interviewer asked me unexpected questions that I had not prepared for. At first, I panicked, but then I took a deep breath and answered honestly. I explained my skills and shared real examples from my experience. To my surprise, the interviewer smiled and said she appreciated my authenticity. Two days later, I received a call offering me the position. That interview taught me that being genuine is more important than being perfect.',
    wordCount: 117,
    topics: ['story', 'career', 'learning experience', 'success'],
    keyVocabulary: ['rehearsing', 'unexpected', 'panicked', 'authenticity', 'genuine', 'offering'],
    comprehensionQuestions: [
      'How did the person prepare for the interview?',
      'What challenge did they face?',
      'What lesson did they learn?',
      'What was the final result?'
    ]
  },

  // Mini Histórias - B2 Level
  {
    id: 'story-b2-1',
    level: 'B2',
    difficulty: 8,
    title: 'The Missed Flight',
    text: 'It was supposed to be a straightforward business trip to Singapore. I had double-checked my flight details and arrived at the airport with plenty of time to spare. However, when I reached the check-in counter, I discovered that the airline had changed my flight time without notification, and the plane had already departed. Initially, I felt frustrated and anxious about missing an important meeting. But instead of dwelling on the problem, I contacted my colleagues, rescheduled the meeting, and booked the next available flight. During the unexpected six-hour wait, I had time to reflect and prepare more thoroughly for my presentation. When I finally arrived and delivered my presentation the next day, it went better than I could have imagined. Sometimes setbacks become opportunities in disguise.',
    wordCount: 139,
    topics: ['story', 'problem-solving', 'business', 'perspective'],
    keyVocabulary: ['straightforward', 'departed', 'dwelling on', 'rescheduled', 'setbacks', 'in disguise'],
    comprehensionQuestions: [
      'What problem did the person encounter?',
      'How did they handle the situation?',
      'What positive outcome resulted?',
      'What lesson does the story teach?'
    ]
  },

  // Mini Histórias - C1 Level
  {
    id: 'story-c1-1',
    level: 'C1',
    difficulty: 10,
    title: 'The Decision That Changed Everything',
    text: 'Five years ago, I stood at a crossroads in my career. I had spent a decade climbing the corporate ladder in a prestigious tech company, earning a substantial salary and accumulating impressive titles. Yet, despite these conventional markers of success, I felt an increasing sense of emptiness. Every morning, I would wake up dreading the day ahead, going through the motions without any real sense of purpose or fulfillment. The turning point came during a conversation with my grandmother, who asked me a simple but profound question: "If money were not a concern, what would you do with your life?" I realized I had been so focused on what I should do that I had never asked myself what I wanted to do. After months of soul-searching and careful planning, I made the difficult decision to leave my secure position and pursue my passion for education. Today, as a teacher helping students discover their potential, I earn less money but feel infinitely richer in the ways that truly matter.',
    wordCount: 173,
    topics: ['story', 'life choices', 'career change', 'fulfillment'],
    keyVocabulary: ['crossroads', 'prestigious', 'conventional markers', 'emptiness', 'profound', 'soul-searching', 'infinitely'],
    comprehensionQuestions: [
      'What was the person\'s situation five years ago?',
      'What question triggered the change?',
      'What decision did they make?',
      'How do they feel about their choice now?'
    ]
  }
];
