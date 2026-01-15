# 🤖 Sistema Automático de Aprendizado - FluentBuddy

## Como Funciona o Fluxo Automático

O sistema agora detecta e marca requisitos automaticamente de 3 formas:

### 1️⃣ Durante Conversação com IA

**Análise Automática a cada 6 turnos:**
- Sistema analisa todas as suas mensagens
- IA avalia domínio dos requisitos não completos
- Se você demonstrou 80%+ de domínio → marca automaticamente como completo

**Arquivo:** `hooks/useProgressTracker.ts` (linha ~26)

```typescript
// A cada 6 turnos de conversa
if (userEntries.length % 6 === 0) {
  await analyzeRequirements(entries, newStats.level);
}
```

**Critérios de Avaliação:**
- ✅ Uso correto no contexto
- ✅ Aplicação natural
- ✅ Consistência nas mensagens
- ✅ Nível de complexidade apropriado

---

### 2️⃣ Durante Exercícios Práticos

**Auto-marcação quando domínio ≥ 80%:**
- Você acerta exercícios consistentemente
- Sistema rastreia `masteryLevel` (0-100)
- Quando atinge 80%+ → marca requisitos relacionados automaticamente

**Arquivo:** `components/VocabularyExercises.tsx` (linha ~227)

```typescript
if (updatedProgress.masteryLevel >= 80 && currentExercise.tags) {
  // Auto-marca requisitos relacionados às tags do exercício
  const requirementsToComplete = currentExercise.tags
    .map(tag => `${currentLevel}-${category}-${tag}`)
    .filter(reqId => !completedRequirements.includes(reqId));
  
  // Adiciona aos requisitos completos
  completedRequirements = [...completedRequirements, ...requirementsToComplete];
}
```

**Exemplo:**
```typescript
Exercício: {
  id: 'a1-complete-1',
  tags: ['be-verb', 'professions']
}

// Se você acertar consistentemente (80%+):
// → Auto-marca: 'a1-grammar-to-be'
```

---

### 3️⃣ Filtro Inteligente de Exercícios

**Priorização Automática:**
- Sistema lê seus requisitos não completos
- Filtra exercícios relacionados apenas aos tópicos que você precisa
- Exercícios são apresentados na ordem de prioridade

**Arquivo:** `components/VocabularyExercises.tsx` (linha ~45)

```typescript
// Priorizar exercícios de requisitos não completos
const exercisesForIncompleteReqs = availableExercises.filter(ex => {
  if (ex.tags) {
    // Exercício é relevante se as tags não estão completas
    return !ex.tags.every(tag => 
      completedRequirements.some(reqId => reqId.includes(tag))
    );
  }
  return true;
});
```

---

## 🎯 Fluxo Completo

```
1. Você pratica (conversação ou exercícios)
   ↓
2. Sistema monitora seu desempenho
   ↓
3. Detecção automática de domínio:
   - Conversação: Análise por IA a cada 6 turnos
   - Exercícios: Baseado em masteryLevel ≥ 80%
   ↓
4. Auto-marcação de requisitos
   ↓
5. Notificação visual 🎉
   ↓
6. Progresso atualizado em tempo real
   ↓
7. Próximos exercícios focam em novos tópicos
```

---

## 🔔 Notificações

**Visual Toast Notification:**
- Aparece no canto superior direito
- Mostra qual requisito foi dominado
- Desaparece automaticamente após 4s

**Arquivo:** `components/RequirementNotification.tsx`

---

## 📊 Sincronização

**Eventos Globais:**
```typescript
// Quando requisito é marcado automaticamente
window.dispatchEvent(new CustomEvent('progressUpdated', { 
  detail: updatedProgress 
}));

// Outros componentes reagem
window.addEventListener('progressUpdated', (event) => {
  // Atualiza UI
});
```

---

## 🎮 Controle do Usuário

**Você ainda pode:**
- ✅ Ver todos os requisitos em "Ver Detalhes"
- ✅ Marcar/desmarcar manualmente
- ✅ Adicionar notas pessoais
- ✅ Visualizar progresso por categoria

O sistema automático apenas **acelera** o processo, mas você mantém controle total!

---

## 🧠 IA Context Injection

**A IA recebe contexto automático:**

```typescript
// Enviado para a IA em cada conversa
const aiContext = `
STUDENT LEARNING PROGRESS:
Current Level: B1
Overall Progress: 15/50 requirements completed (30%)

⚠️ PRIORITY - Incomplete Requirements:
1. Present Perfect Tense
2. Phrasal Verbs
3. Making Polite Requests

INSTRUCTIONS FOR AI:
- Focus teaching on incomplete requirements
- Test retention through questions
- Provide examples for weak areas
`;
```

**Arquivo:** `hooks/useLearningProgress.ts` (função `getAIContext()`)

---

## 🔄 Repetição Espaçada

**Integrado ao sistema:**
- Requisitos marcados entram no sistema de revisão
- Aparecem em "Próximo na Fila" quando precisam revisão
- IA recebe alerta para testar novamente

---

## ⚙️ Configurações

**Tudo funciona offline:**
- ✅ Salvo em `localStorage`
- ☁️ Sincroniza com Firebase (se configurado)
- 🔄 Debounce de 300ms para evitar salvamentos excessivos

**Limites de chamadas à IA:**
- Conversação: Análise a cada 6 turnos (não a cada mensagem)
- Exercícios: Usa `gemini-2.0-flash-exp` (mais barato)
- Custo otimizado com billing configurado

---

## 🚀 Benefícios

1. **Menos trabalho manual** - Não precisa marcar tudo sozinho
2. **Foco inteligente** - Exercícios priorizados automaticamente
3. **Feedback imediato** - Sabe quando dominou um tópico
4. **Aprendizado otimizado** - IA adapta conversas aos seus gaps
5. **Gamificação** - Notificações motivam a continuar

---

**Status:** ✅ Implementado e funcionando!
