# FluentBuddy - AI English Teacher

Plataforma de aprendizado de inglês com IA, incluindo conversação, exercícios e prática de escrita.

## 🚀 Como Configurar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Adicionar sua Gemini API Key

Edite o arquivo `.env.local` e adicione sua chave do Google Gemini:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**Como obter a API Key:**
1. Acesse [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave e cole no arquivo `.env.local`

### 4. Rodar o Projeto

```bash
npm run dev
```

O app estará disponível em `http://localhost:3001`

## 📚 Funcionalidades

### Exercícios de Escrita (WritingExercises)

- **Com API Key configurada:**
  - ✅ Textos gerados por IA adaptados ao seu nível
  - ✅ Tamanho personalizado (50-250 palavras)
  - ✅ Vocabulário e gramática específicos
  - ✅ Avaliação detalhada com feedback da IA
  - ✅ Histórias sempre novas e únicas

- **Sem API Key (modo fallback):**
  - ✅ Textos pré-definidos por nível
  - ✅ Vocabulário e gramática incluídos
  - ✅ Avaliação básica automática
  - ⚠️ Textos limitados aos pré-cadastrados

### Outras Funcionalidades

- Conversação com professores de IA
- Exercícios de vocabulário
- Análise de pronúncia
- Sistema de níveis CEFR (A1-C2)
- Acompanhamento de progresso

## ⚙️ Tecnologias

- React + TypeScript
- Vite
- Google Gemini API (gemini-1.5-flash)
- Tailwind CSS
- Firebase (opcional)

## 🔒 Segurança

- Nunca commite o arquivo `.env.local` (já está no `.gitignore`)
- Mantenha sua API Key em segredo
- Use variáveis de ambiente para informações sensíveis

## 📝 Notas

- A API do Google Gemini tem um plano **gratuito** generoso
- Você pode usar a aplicação sem API Key (modo limitado)
- Para melhor experiência, configure a API Key
- Quantidade de palavras ajustada: muito-curto (50), curto (100), médio (150), longo (200), muito-longo (250)
