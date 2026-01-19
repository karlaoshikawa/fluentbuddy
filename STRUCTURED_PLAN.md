# 🎯 Plano Estruturado de Conversação → C2

## Visão Geral

O **Plano Estruturado** é um sistema progressivo que guia o aluno desde o nível atual até a fluência nativa (C2) através de tópicos específicos e focados.

## Como Funciona

### 1. Modo de Conversação
Na tela inicial, você pode escolher entre dois modos:

- **💬 Conversação Livre**: Fale sobre qualquer assunto
- **🎯 Plano Estruturado → C2**: Siga um plano progressivo com tópicos específicos

### 2. Progressão de Tópicos

O plano contém tópicos organizados por nível CEFR:

#### A1 - Beginner (6 tópicos)
1. Personal Introduction: name, age, nationality, occupation
2. Daily Routines: wake up, breakfast, work/study, hobbies
3. Family Description: members, relationships, activities together
4. Shopping Basics: asking for prices, quantities, colors
5. Describing Your Home: rooms, furniture, location
6. Food Preferences: likes, dislikes, favorite meals

#### A2 - Elementary (6 tópicos)
1. Past Experiences: last weekend, holidays, childhood memories
2. Making Plans: future intentions, invitations, scheduling
3. Health & Body: symptoms, doctor visits, healthy habits
4. Travel Stories: places visited, transportation, accommodation
5. Work & Studies: describe your job/course, colleagues, challenges
6. Comparing Things: cities, products, people, preferences

#### B1 - Intermediate (6 tópicos)
1. Expressing Opinions: agree, disagree, justify your viewpoint
2. Problem-Solving: describe a problem and propose solutions
3. Telling Stories: narratives with sequence and details
4. Making Suggestions: planning events, giving advice
5. Describing Changes: how things have evolved over time
6. Hypothetical Situations: "What would you do if...?"

#### B2 - Upper Intermediate (6 tópicos)
1. Debating Topics: environment, technology, education, society
2. Professional Communication: meetings, presentations, negotiations
3. Abstract Concepts: success, happiness, culture, values
4. Analyzing Situations: causes, effects, consequences
5. Persuasive Arguments: convince someone of your position
6. Complex Narratives: stories with subplots and character development

#### C1 - Advanced (6 tópicos)
1. Sophisticated Discussions: politics, economics, philosophy
2. Nuanced Opinions: seeing multiple perspectives, gray areas
3. Idiomatic Language: natural expressions, phrasal verbs, colloquialisms
4. Strategic Communication: diplomacy, tact, indirect language
5. Critical Analysis: evaluating arguments, identifying biases
6. Professional Expertise: deep discussions about your field

#### C2 - Mastery (6 tópicos)
1. Native-like Fluency: spontaneous, effortless communication
2. Cultural References: understanding and using cultural nuances
3. Advanced Rhetoric: humor, irony, sarcasm, wordplay
4. Professional Excellence: high-level business and academic discourse
5. Mastery of Style: formal, informal, technical, literary
6. Complete Autonomy: handle any topic with precision and sophistication

### 3. Durante a Sessão

Quando você escolhe o **Plano Estruturado**:

1. ✅ A IA foca a **conversa inteira** no tópico atual
2. ✅ Faz perguntas específicas sobre esse tema
3. ✅ Corrige sua gramática e sugere formas mais naturais
4. ✅ Incorpora vocabulário e estruturas relevantes para o tópico
5. ✅ Mantém você focado no objetivo de aprendizado

### 4. Controles Durante a Conversa

No card de progresso, você tem 3 botões:

- **← Anterior**: Voltar para o tópico anterior (para revisar)
- **✓ Completar**: Marcar o tópico atual como completo e avançar
- **Próximo →**: Pular para o próximo tópico (sem marcar como completo)

### 5. Acompanhamento de Progresso

O sistema salva automaticamente:
- ✅ Tópico atual
- ✅ Tópicos completados
- ✅ Total de sessões realizadas
- ✅ Porcentagem de progresso até o C2

## Diferenças entre os Modos

| Aspecto | Conversação Livre | Plano Estruturado |
|---------|-------------------|-------------------|
| **Tópico** | Qualquer assunto | Tópico específico do plano |
| **Foco** | Fluência geral | Aprendizado sistemático |
| **Objetivo** | Prática natural | Progressão para C2 |
| **IA** | Segue a conversa | Guia a conversa |
| **Correções** | Sempre presentes | Sempre presentes |
| **Progresso** | Baseado em requisitos | Baseado em tópicos |

## Dicas de Uso

### 🎯 Para Melhores Resultados

1. **Complete os tópicos em ordem** - A progressão é cuidadosamente planejada
2. **Pratique cada tópico até se sentir confortável** - Não tenha pressa
3. **Use o botão "Anterior" para revisar** - Repetição é essencial
4. **Combine com exercícios** - Reforce o vocabulário aprendido
5. **Seja consistente** - Pratique regularmente para melhores resultados

### 💡 Quando Usar Cada Modo

**Use Conversação Livre quando:**
- Quer praticar algo específico que não está no plano
- Precisa de prática espontânea
- Quer discutir um tema atual
- Já domina seu nível atual

**Use Plano Estruturado quando:**
- Quer progresso sistemático
- Está estudando para um exame (TOEFL, IELTS, etc.)
- Quer garantir que cobriu todos os tópicos importantes
- Prefere um caminho claro de aprendizado

## Integração com Outros Sistemas

O Plano Estruturado se integra com:
- ✅ **Learning Requirements**: Incorpora requisitos do seu nível
- ✅ **Sistema de Correção**: Sempre corrige gramática e sugere melhorias
- ✅ **Avaliação de Progresso**: Analisa seu desempenho a cada 6 turnos
- ✅ **Exercícios**: Pratica vocabulário dos tópicos

## Armazenamento

Todos os dados são salvos localmente em:
```
localStorage.fluentbuddy_structured_plan
```

Estrutura:
```typescript
{
  currentTopicIndex: number,
  topicsCompleted: string[],
  lastSessionDate: Date,
  totalSessions: number
}
```

## Roadmap Futuro

Possíveis melhorias:
- [ ] Tópicos personalizados baseados em interesses
- [ ] Repetição espaçada de tópicos antigos
- [ ] Certificados de conclusão por nível
- [ ] Estatísticas detalhadas por tópico
- [ ] Sugestões de tópicos baseadas em fraquezas identificadas
