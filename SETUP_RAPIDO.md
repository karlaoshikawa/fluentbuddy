# 🚀 Setup Rápido - Sync entre Dispositivos

## ⚡ 5 Passos Rápidos (15 minutos)

### 1️⃣ Criar Conta Firebase (GRÁTIS)

1. Acesse: https://console.firebase.google.com/
2. **"Adicionar projeto"** → Nome: `fluentbuddy` → Criar

### 2️⃣ Ativar Firestore (Banco de Dados)

1. Menu lateral: **"Firestore Database"**
2. **"Criar banco de dados"** → Modo produção → us-central → Ativar
3. Aba **"Regras"** → Cole isso:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. **"Publicar"**

### 3️⃣ Ativar Login Anônimo

1. Menu lateral: **"Authentication"**
2. **"Começar"** → Aba "Sign-in method"
3. **"Anonymous"** → Ativar → Salvar

### 4️⃣ Pegar suas Credenciais

1. ⚙️ **Configurações** → "Configurações do projeto"
2. Role até **"Seus aplicativos"** → Clique em **</>** (Web)
3. Apelido: `FluentBuddy` → Registrar
4. **COPIE** o `firebaseConfig` que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // ← COPIE ISSO
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### 5️⃣ Configurar no Projeto

**Opção A - Arquivo .env.local (Recomendado)**

Crie arquivo `.env.local` na raiz do projeto com seus dados:

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

**Opção B - Direto no código (Mais rápido)**

Edite `firebase.config.ts` linha 7-14 e cole suas credenciais:

```typescript
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY",
  authDomain: "COLE_SEU_AUTH_DOMAIN",
  projectId: "COLE_SEU_PROJECT_ID",
  storageBucket: "COLE_SEU_STORAGE_BUCKET",
  messagingSenderId: "COLE_SEU_SENDER_ID",
  appId: "COLE_SEU_APP_ID"
};
```

## ✅ Testar

```bash
npm run dev
```

1. Marque alguns requisitos no computador
2. Abra no celular (Vercel link)
3. 🎉 Progresso sincronizado!

## 📱 Vercel (para usar no celular)

Na Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. Adicione TODAS as variáveis `VITE_FIREBASE_*` do seu `.env.local`
3. Marque: Production + Preview + Development
4. **Redeploy**

## 🎯 Pronto!

Agora você pode:
- ✅ Estudar no computador
- ✅ Estudar no celular
- ✅ Progresso sincroniza automaticamente
- ✅ Funciona offline (sincroniza quando conectar)

## 🐛 Deu erro?

Veja o [FIREBASE_SETUP.md](FIREBASE_SETUP.md) com mais detalhes.

---

**Tempo total: ~15 minutos** ⏱️

Firebase é **100% GRÁTIS** para seu uso! 🎁
