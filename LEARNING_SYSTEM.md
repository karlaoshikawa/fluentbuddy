# Sistema de Acompanhamento de Aprendizado - FluentBuddy

## 📚 Visão Geral

O sistema de acompanhamento de aprendizado permite que você monitore seu progresso no inglês de forma detalhada, seguindo os níveis CEFR (Common European Framework of Reference for Languages) de A1 a C2.

## 🎯 Características

### Níveis CEFR

- **A1 (Beginner)**: Frases básicas e situações cotidianas
- **A2 (Elementary)**: Comunicação simples em tarefas rotineiras
- **B1 (Intermediate)**: Lidar com a maioria das situações de viagem
- **B2 (Upper Intermediate)**: Interagir com fluência com falantes nativos
- **C1 (Advanced)**: Expressar ideias fluentemente
- **C2 (Proficiency)**: Compreender praticamente tudo que ouve ou lê

### Categorias de Aprendizado

Cada nível é dividido em 6 categorias:

1. **📖 Vocabulário**: Palavras e expressões necessárias
2. **📝 Gramática**: Estruturas gramaticais do nível
3. **🔄 Verbos**: Verbos essenciais e suas conjugações
4. **🗣️ Conversação**: Habilidades de fala
5. **✍️ Escrita**: Habilidades de escrita
6. **🎵 Pronúncia**: Padrões de pronúncia

## 📊 Requisitos por Nível

### A1 - Beginner (18 requisitos)
- Números, família, cores, dias da semana
- Verbo "to be", artigos, pronomes
- Verbos básicos e rotina diária
- Saudações e pedidos simples

### A2 - Elementary (18 requisitos)
- Emoções, clima, roupas, hobbies
- Past Simple, Future, Present Continuous
- Verbos irregulares e phrasal verbs básicos
- Compras, restaurante, direções

### B1 - Intermediate (20 requisitos)
- Trabalho, saúde, tecnologia, educação
- Present Perfect, condicionais, voz passiva
- Phrasal verbs comuns
- Opiniões, histórias, reclamações

### B2 - Upper Intermediate (18 requisitos)
- Conceitos abstratos, idiomas, collocations
- Perfect Continuous, 2ª e 3ª condicionais
- Phrasal verbs avançados
- Debates, apresentações, negociações

### C1 - Advanced (18 requisitos)
- Vocabulário acadêmico, metáforas
- Inversão, cleft sentences, subjuntivo
- Discurso acadêmico, persuasão avançada
- Artigos acadêmicos, propostas profissionais

### C2 - Proficiency (12 requisitos)
- Terminologia especializada
- Domínio completo de todas as estruturas
- Fluência nativa
- Escrita criativa e profissional

## 🚀 Como Usar

### 1. Componente LearningPath

```tsx
import { LearningPath } from './components/LearningPath';

function App() {
  const [userLevel, setUserLevel] = useState<CEFRLevel>('B1');
  
  return (
    <LearningPath currentLevel={userLevel} />
  );
}
```

### 2. Hook useLearningProgress

```tsx
import { useLearningProgress } from './hooks/useLearningProgress';

function MyComponent() {
  const {
    progress,
    markCompleted,
    markIncomplete,
    addNote,
    getAIContext,
    getNextRequirement
  } = useLearningProgress('B1');

  // Marcar requisito como completo
  const handleComplete = () => {
    markCompleted('b1-vocab-work');
  };

  // Obter contexto para a IA
  const aiContext = getAIContext();
  
  // Obter próximo requisito
  const next = getNextRequirement();
}
```

### 3. Resumo de Progresso

```tsx
import { LearningProgressSummary } from './components/LearningProgressSummary';

function Dashboard() {
  return (
    <LearningProgressSummary 
      currentLevel="B1"
      onViewDetails={() => console.log('Ver detalhes')}
    />
  );
}
```

## 🤖 Integração com IA

O sistema fornece contexto automático para a IA através do método `getAIContext()`:

```typescript
const { getAIContext } = useLearningProgress('B1');
const context = getAIContext();

// Use o contexto no prompt da IA
const systemPrompt = SYSTEM_INSTRUCTION(persona, level, context);
```

A IA receberá informações sobre:
- Nível atual do estudante
- Progresso geral (% completo)
- Categoria mais fraca
- Próximos 5 requisitos a aprender
- Áreas que precisam de foco

## 💾 Armazenamento

Todo o progresso é salvo automaticamente no `localStorage`:

```typescript
{
  currentLevel: 'B1',
  completedRequirements: ['b1-vocab-work', 'b1-grammar-present-perfect'],
  lastUpdated: '2026-01-09T...',
  notes: {
    'b1-vocab-work': 'Pratiquei as palavras relacionadas a trabalho...'
  }
}
```

## 📝 Exemplos de Uso

### Exemplo 1: Marcar Múltiplos Requisitos

```tsx
const { markCompleted } = useLearningProgress('A1');

// Após uma aula de vocabulário
markCompleted('a1-vocab-numbers');
markCompleted('a1-vocab-colors');
markCompleted('a1-vocab-family');
```

### Exemplo 2: Adicionar Notas de Estudo

```tsx
const { addNote } = useLearningProgress('B1');

addNote('b1-grammar-present-perfect', 
  'Entendi a diferença entre present perfect e past simple. ' +
  'Preciso praticar mais com "already" e "yet".'
);
```

### Exemplo 3: Verificar Progresso por Categoria

```tsx
const { getCategoryProgress } = useLearningProgress('B1');

const vocabProgress = getCategoryProgress('vocabulary');
console.log(`Vocabulário: ${vocabProgress.completed}/${vocabProgress.total}`);
// Output: "Vocabulário: 2/4 (50%)"
```

### Exemplo 4: Contexto Personalizado para IA

```tsx
const { getAIContext } = useLearningProgress('B1');

// Antes de iniciar uma sessão de chat
const learningContext = getAIContext();
const systemPrompt = SYSTEM_INSTRUCTION(teacherPersona, 'B1', learningContext);

// A IA agora sabe exatamente o que você precisa praticar!
```

## 🎨 Personalização

### Adicionar Novos Requisitos

Edite o arquivo `data.tsx`:

```typescript
export const CEFR_LEVEL_REQUIREMENTS: Record<CEFRLevel, LevelRequirements> = {
  'B1': {
    // ...
    requirements: [
      // ...requisitos existentes
      {
        id: 'b1-vocab-meu-requisito',
        category: 'vocabulary',
        name: 'Meu Novo Requisito',
        description: 'Descrição detalhada',
        examples: ['Exemplo 1', 'Exemplo 2']
      }
    ]
  }
};
```

### Estilizar Componentes

Todos os componentes usam CSS-in-JS inline. Para personalizar:

```tsx
<style jsx>{`
  .learning-path {
    /* Seus estilos aqui */
  }
`}</style>
```

## 📈 Dicas de Uso

1. **Seja Consistente**: Marque requisitos como completos apenas quando você realmente dominá-los
2. **Use as Notas**: Documente suas dúvidas e descobertas em cada requisito
3. **Foque nas Áreas Fracas**: O sistema automaticamente identifica suas áreas mais fracas
4. **Pratique com a IA**: A IA ajustará as conversas para focar no que você precisa aprender
5. **Revise Regularmente**: Volte aos requisitos completados para revisar

## 🔧 Solução de Problemas

### Progresso não está salvando
- Verifique se o `localStorage` está habilitado no navegador
- Limpe o cache se necessário

### IA não está usando o contexto
- Certifique-se de passar o `learningContext` para `SYSTEM_INSTRUCTION()`
- Verifique se o hook está sendo chamado corretamente

### Requisitos não aparecem
- Verifique o nível atual do usuário
- Confirme que os IDs dos requisitos estão corretos

## 📚 Referências

- [CEFR Framework](https://www.coe.int/en/web/common-european-framework-reference-languages)
- [English Grammar Levels](https://www.englishgrammar.org/)
- [Cambridge English](https://www.cambridgeenglish.org/)

---

**FluentBuddy** - Seu parceiro no aprendizado de inglês! 🚀
