# 🔥 Configuração do Firebase - Sincronização em Nuvem

## 📋 Pré-requisitos

Você precisará criar uma conta gratuita no Firebase para sincronizar seu progresso entre dispositivos.

## 🚀 Passo a Passo

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** (ou "Create a project")
3. Nome do projeto: `fluentbuddy` (ou o nome que preferir)
4. Desabilite o Google Analytics (opcional para este projeto)
5. Clique em **"Criar projeto"**

### 2. Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"** (vamos configurar as regras depois)
4. Escolha a localização: **"us-central"** ou mais próxima de você
5. Clique em **"Ativar"**

### 3. Configurar Regras de Segurança

1. No Firestore, vá em **"Regras"** (Rules)
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que usuários autenticados leiam/escrevam apenas seus próprios dados
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clique em **"Publicar"**

### 4. Habilitar Autenticação Anônima

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"** (Get started)
3. Na aba **"Sign-in method"**, clique em **"Anonymous"**
4. Ative o switch e clique em **"Salvar"**

### 5. Obter Credenciais do Projeto

1. No menu lateral, clique no ícone de **⚙️ Configurações** (Settings)
2. Clique em **"Configurações do projeto"** (Project settings)
3. Role até **"Seus aplicativos"** (Your apps)
4. Clique no ícone **</>** (Web)
5. Registre o app:
   - Apelido: `FluentBuddy Web`
   - **NÃO** marque Firebase Hosting
   - Clique em **"Registrar app"**
6. Copie o objeto `firebaseConfig` que aparece

### 6. Configurar no Projeto

#### Opção A: Variáveis de Ambiente (Recomendado para Vercel)

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

2. **Importante**: Adicione `.env.local` no `.gitignore` se ainda não estiver

3. Na **Vercel Dashboard**:
   - Vá em **Settings** > **Environment Variables**
   - Adicione cada variável acima
   - Marque para usar em: **Production**, **Preview** e **Development**
   - Faça **Redeploy** do projeto

4. Atualize `firebase.config.ts` para usar as variáveis:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

#### Opção B: Hardcoded (Mais Rápido, Menos Seguro)

Edite `firebase.config.ts` e substitua os valores de exemplo pelos seus:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### 7. Instalar Dependências do Firebase

```bash
npm install firebase
```

### 8. Testar

1. Inicie o servidor: `npm run dev`
2. Abra o app no navegador
3. Marque alguns requisitos como completos
4. Verifique no Firebase Console > Firestore Database
5. Você deve ver uma coleção `userProgress` com seu documento
6. Abra o app em outro dispositivo ou navegador - o progresso deve sincronizar! 🎉

## 🎯 Recursos do Firebase Gratuito

- ✅ **1 GB** de armazenamento
- ✅ **50,000 leituras** por dia
- ✅ **20,000 escritas** por dia
- ✅ **20,000 exclusões** por dia
- ✅ Sincronização em **tempo real**
- ✅ **Ilimitado** usuários anônimos

**Isso é mais que suficiente** para uso pessoal! 🚀

## 🔐 Segurança

As regras configuradas garantem que:
- ✅ Cada usuário só acessa seus próprios dados
- ✅ Autenticação é obrigatória
- ✅ Ninguém pode ler dados de outros usuários

## 🐛 Troubleshooting

### Erro: "Firebase not initialized"
- Verifique se as credenciais estão corretas em `firebase.config.ts`
- Veja o console do navegador para erros específicos

### Erro: "Permission denied"
- Verifique se as regras do Firestore foram configuradas
- Confirme que a autenticação anônima está habilitada

### Progresso não sincroniza
- Abra o console do navegador e procure por mensagens do Firebase
- Verifique sua conexão com a internet
- Tente fazer logout/login (limpar cache)

### Variáveis de ambiente não funcionam na Vercel
- Certifique-se de que todas começam com `VITE_`
- Faça redeploy após adicionar as variáveis
- Aguarde alguns minutos para propagar

## 📱 Testando Sincronização

1. **Computador**: Marque alguns requisitos como completos
2. **Celular**: Abra o app pelo link da Vercel
3. **Mágica**: O progresso aparece automaticamente! ✨
4. **Teste reverso**: Marque algo no celular e veja aparecer no computador

## 💡 Dicas

- O Firebase sincroniza **automaticamente** em tempo real
- Funciona **offline** - salva localmente e sincroniza quando conectar
- Você pode acessar de **quantos dispositivos** quiser
- O progresso mais **recente** sempre prevalece

## 🎓 Próximos Passos (Opcional)

Quer melhorar ainda mais? Considere:

1. **Login com Google**: Para ter uma conta permanente
2. **Backup manual**: Exportar/importar progresso
3. **Compartilhar progresso**: Com professores ou amigos
4. **Analytics**: Ver estatísticas de aprendizado ao longo do tempo

---

**FluentBuddy** - Aprenda inglês em qualquer lugar! 🌍📱💻
