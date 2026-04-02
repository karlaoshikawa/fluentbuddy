# FluentBuddy - AI English Teacher

Plataforma de aprendizado de inglês com IA, incluindo conversação, exercícios e prática de escrita.

## 🚀 Como Configurar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 3. Adicionar sua OpenAI API Key

Edite o arquivo `.env` e adicione sua chave da OpenAI:

```env
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

**Como obter a API Key:**
1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave e cole no arquivo `.env`

### 4. Rodar o Projeto

```bash
npm run dev
```

O app estará disponível em `http://localhost:3001`

## 📚 Funcionalidades

### Exercícios de Escrita (WritingExercises)

- **Com API Key configurada:**
  - ✅ Textos gerados por IA adaptados ao seu nível
  - ✅ Tamanho personalizado (3-15 linhas)
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
- OpenAI API (GPT-4o-mini)
- Tailwind CSS
- Firebase (opcional)

## 🔒 Segurança

- Nunca commite o arquivo `.env` (já está no `.gitignore`)
- Mantenha sua API Key em segredo
- Use variáveis de ambiente para informações sensíveis

## 📝 Notas

- A API da OpenAI é paga (mas muito barata para uso pessoal)
- Você pode usar a aplicação sem API Key (modo limitado)
- Para melhor experiência, configure a API Key
