# 🎓 Exemplos Práticos de Uso - Sistema de Aprendizado

## Exemplo 1: Setup Básico

```tsx
import { LearningPath } from './components/LearningPath';
import { useLearningProgress } from './hooks/useLearningProgress';

function MyApp() {
  const { progress, getAIContext } = useLearningProgress('B1');
  
  return (
    <div>
      <h1>Meu Progresso: {progress.completedRequirements.length} requisitos</h1>
      <LearningPath currentLevel="B1" />
    </div>
  );
}
```

## Exemplo 2: Integração Completa com Chat

```tsx
import { useLiveChat } from './hooks/useLiveChat';
import { useLearningProgress } from './hooks/useLearningProgress';
import { useProgressTracker } from './hooks/useProgressTracker';

function EnglishPracticeApp() {
  const { stats, runAssessment } = useProgressTracker();
  const { getAIContext } = useLearningProgress(stats.level);
  
  // A IA agora sabe exatamente o que você precisa praticar!
  const learningContext = getAIContext();
  
  const { 
    status, 
    transcriptions, 
    startSession, 
    stopSession 
  } = useLiveChat(
    teacherPersona, 
    stats.level, 
    runAssessment,
    learningContext // 🔥 Contexto de aprendizado
  );

  return (
    <div>
      <button onClick={startSession}>
        Começar Prática Personalizada
      </button>
      {/* Chat interface */}
    </div>
  );
}
```

## Exemplo 3: Dashboard de Progresso

```tsx
import { LearningProgressSummary } from './components/LearningProgressSummary';
import { EvolutionDashboard } from './components/EvolutionDashboard';

function Dashboard() {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div>
      <EvolutionDashboard stats={stats} />
      
      <LearningProgressSummary 
        currentLevel="B1"
        onViewDetails={() => setShowDetails(true)}
      />
      
      {showDetails && (
        <Modal>
          <LearningPath currentLevel="B1" />
        </Modal>
      )}
    </div>
  );
}
```

## Exemplo 4: Marcar Requisitos Como Completos

```tsx
function RequirementTracker() {
  const { 
    markCompleted, 
    markIncomplete,
    getNextRequirement 
  } = useLearningProgress('A2');

  const handlePractice = async () => {
    // Após praticar algo específico
    markCompleted('a2-vocab-emotions');
    markCompleted('a2-grammar-past-simple');
    
    // Ver o que vem a seguir
    const next = getNextRequirement();
    console.log('Próximo:', next?.name);
  };

  return (
    <button onClick={handlePractice}>
      Marcar como Completo
    </button>
  );
}
```

## Exemplo 5: Sistema de Notas Pessoais

```tsx
function StudyNotes() {
  const { progress, addNote } = useLearningProgress('B1');
  const [note, setNote] = useState('');
  const requirementId = 'b1-grammar-present-perfect';

  const handleSaveNote = () => {
    addNote(requirementId, note);
    alert('Nota salva!');
  };

  return (
    <div>
      <h3>Minhas Anotações: Present Perfect</h3>
      <textarea 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Escreva suas dúvidas, descobertas ou exemplos..."
      />
      <button onClick={handleSaveNote}>Salvar Nota</button>
      
      {progress.notes[requirementId] && (
        <div className="saved-note">
          <strong>Nota anterior:</strong>
          <p>{progress.notes[requirementId]}</p>
        </div>
      )}
    </div>
  );
}
```

## Exemplo 6: Filtrar por Categoria

```tsx
import { getRequirementsByCategory } from './data';

function VocabularyPractice() {
  const { markCompleted } = useLearningProgress('B2');
  const vocabRequirements = getRequirementsByCategory('B2', 'vocabulary');
  
  return (
    <div>
      <h2>Vocabulário B2</h2>
      {vocabRequirements.map(req => (
        <div key={req.id}>
          <h3>{req.name}</h3>
          <p>{req.description}</p>
          <ul>
            {req.examples?.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>
          <button onClick={() => markCompleted(req.id)}>
            ✓ Domino Este Tópico
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Exemplo 7: Progresso por Categoria

```tsx
function CategoryProgress() {
  const { getCategoryProgress } = useLearningProgress('C1');
  
  const categories = ['vocabulary', 'grammar', 'verbs', 'speaking', 'writing', 'pronunciation'];
  
  return (
    <div className="category-grid">
      {categories.map(cat => {
        const progress = getCategoryProgress(cat as any);
        return (
          <div key={cat} className="category-card">
            <h4>{cat}</h4>
            <div className="progress-bar">
              <div style={{ width: `${progress.percentage}%` }} />
            </div>
            <p>{progress.completed} / {progress.total}</p>
          </div>
        );
      })}
    </div>
  );
}
```

## Exemplo 8: Contexto da IA em Tempo Real

```tsx
function AIContextViewer() {
  const { getAIContext, getLearningContext } = useLearningProgress('B1');
  
  const context = getLearningContext();
  const aiPrompt = getAIContext();
  
  return (
    <div>
      <h3>O que a IA sabe sobre você:</h3>
      
      <div className="context-card">
        <h4>Próximos Requisitos:</h4>
        <ul>
          {context.currentRequirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
      
      <div className="context-card">
        <h4>Áreas de Foco (< 50% completo):</h4>
        <p>{context.focusAreas.join(', ')}</p>
      </div>
      
      <div className="context-card">
        <h4>Categoria Mais Fraca:</h4>
        <p>{context.weakestCategory}</p>
      </div>
      
      <details>
        <summary>Ver Prompt Completo da IA</summary>
        <pre>{aiPrompt}</pre>
      </details>
    </div>
  );
}
```

## Exemplo 9: Mudança de Nível

```tsx
function LevelProgression() {
  const { stats } = useProgressTracker();
  const { updateLevel, progress } = useLearningProgress(stats.level);
  
  const handleLevelUp = () => {
    if (stats.level === 'B1') {
      updateLevel('B2');
      alert('Parabéns! Você avançou para B2!');
    }
  };
  
  // Calcular se está pronto para avançar
  const levelRequirements = CEFR_LEVEL_REQUIREMENTS[stats.level];
  const completed = progress.completedRequirements.filter(id => 
    levelRequirements.requirements.some(req => req.id === id)
  ).length;
  const total = levelRequirements.requirements.length;
  const percentage = (completed / total) * 100;
  
  const canLevelUp = percentage >= 80;
  
  return (
    <div>
      <h2>Progresso no Nível {stats.level}</h2>
      <div className="progress-bar">
        <div style={{ width: `${percentage}%` }} />
      </div>
      <p>{completed} / {total} requisitos ({percentage.toFixed(0)}%)</p>
      
      {canLevelUp ? (
        <button onClick={handleLevelUp} className="level-up-btn">
          🎉 Avançar para o Próximo Nível!
        </button>
      ) : (
        <p>Complete {Math.ceil(total * 0.8) - completed} requisitos para avançar</p>
      )}
    </div>
  );
}
```

## Exemplo 10: Exportar/Importar Progresso

```tsx
function ProgressManager() {
  const { progress } = useLearningProgress('B1');
  
  const exportProgress = () => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-english-progress.json';
    a.click();
  };
  
  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string);
      localStorage.setItem('learning_progress', JSON.stringify(data));
      alert('Progresso importado!');
      window.location.reload();
    };
    reader.readAsText(file);
  };
  
  return (
    <div>
      <button onClick={exportProgress}>
        📥 Exportar Progresso
      </button>
      
      <label>
        📤 Importar Progresso
        <input 
          type="file" 
          accept=".json"
          onChange={importProgress}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
```

## Exemplo 11: Gamificação - Sistema de Pontos

```tsx
function Gamification() {
  const { progress } = useLearningProgress('B1');
  
  // Calcular pontos
  const points = progress.completedRequirements.length * 10;
  const level = Math.floor(points / 100) + 1;
  
  // Badges
  const badges = [];
  if (progress.completedRequirements.length >= 5) badges.push('🌟 First Steps');
  if (progress.completedRequirements.length >= 10) badges.push('🔥 On Fire');
  if (progress.completedRequirements.length >= 20) badges.push('💪 Dedicated Learner');
  
  return (
    <div className="gamification">
      <div className="points">
        <h2>🎮 Level {level}</h2>
        <p>{points} pontos</p>
      </div>
      
      <div className="badges">
        <h3>Badges Conquistadas:</h3>
        {badges.map(badge => (
          <span key={badge} className="badge">{badge}</span>
        ))}
      </div>
      
      <div className="next-badge">
        <p>Próxima badge em {Math.max(0, 5 - progress.completedRequirements.length)} requisitos</p>
      </div>
    </div>
  );
}
```

## Exemplo 12: Widget de Motivação

```tsx
function MotivationalWidget() {
  const { progress, getNextRequirement } = useLearningProgress('B1');
  
  const today = new Date().toDateString();
  const lastUpdate = new Date(progress.lastUpdated).toDateString();
  const studiedToday = today === lastUpdate;
  
  const next = getNextRequirement();
  
  const motivationalQuotes = [
    "Cada palavra nova é uma conquista! 🌟",
    "Você está progredindo! Continue assim! 💪",
    "O inglês abre portas! Keep going! 🚪",
    "Consistency is key! You're doing great! 🔑"
  ];
  
  const randomQuote = motivationalQuotes[
    Math.floor(Math.random() * motivationalQuotes.length)
  ];
  
  return (
    <div className="motivation-widget">
      <div className="streak">
        {studiedToday ? '✅ Estudou hoje!' : '⏰ Ainda não estudou hoje'}
      </div>
      
      <div className="quote">
        <p>{randomQuote}</p>
      </div>
      
      {next && (
        <div className="next-challenge">
          <h4>🎯 Desafio de Hoje:</h4>
          <p>Aprenda: {next.name}</p>
          <button>Começar Agora!</button>
        </div>
      )}
    </div>
  );
}
```

---

## 💡 Dicas Avançadas

### 1. Persistência em Múltiplos Dispositivos
Use Firebase ou outro backend para sincronizar o progresso:

```tsx
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

async function syncProgress(userId: string, progress: UserProgress) {
  const db = getFirestore();
  await setDoc(doc(db, 'userProgress', userId), progress);
}
```

### 2. Análise de Progresso com Gráficos
Use bibliotecas como Chart.js ou Recharts:

```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

function ProgressChart({ history }) {
  return (
    <LineChart data={history}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="completed" stroke="#8884d8" />
    </LineChart>
  );
}
```

### 3. Notificações de Progresso
```tsx
if (progress.completedRequirements.length % 5 === 0) {
  new Notification('FluentBuddy', {
    body: `Parabéns! Você completou ${progress.completedRequirements.length} requisitos!`,
    icon: '/icon.png'
  });
}
```

---

**FluentBuddy** - Transformando aprendizado em resultados! 🚀
