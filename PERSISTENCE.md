# 💾 Sistema de Persistência de Dados

## Como seus dados são salvos

### Modo Local (Padrão - Sempre Funciona)
✅ **Seu progresso SEMPRE é salvo automaticamente no localStorage do navegador**
- ✅ Funciona sem necessidade de configuração
- ✅ Funciona offline
- ✅ Não precisa de conta ou login
- ⚠️ Progresso fica salvo apenas neste navegador/dispositivo
- ⚠️ Se limpar o cache do navegador, os dados são perdidos

**O que é salvo:**
- ✅ Requisitos CEFR completados
- ✅ Suas notas em cada requisito
- ✅ Agendamento de revisões (spaced repetition)
- ✅ Histórico de conversas
- ✅ Nível atual (A1, A2, B1, etc)

### Modo Cloud (Opcional - Sync entre Dispositivos)
☁️ **Firebase Firestore para sincronizar entre celular + computador**
- ⚠️ Requer configuração (ver FIREBASE_SETUP.md)
- ✅ Sincroniza automaticamente entre todos os dispositivos
- ✅ Backup na nuvem
- ✅ Nunca perde dados mesmo limpando cache

## Status Atual

**Você está em:** 💾 **Modo Local**

Seu progresso está sendo salvo localmente e está 100% funcional! 

Para habilitar sync entre dispositivos, siga o arquivo `FIREBASE_SETUP.md`.

## Como Funciona

```
┌─────────────────────────────────────────────┐
│  Você marca um requisito como completo      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  SEMPRE salva no localStorage (primário)    │  ← SEMPRE FUNCIONA
└─────────────────┬───────────────────────────┘
                  │
                  ▼
          Firebase configurado?
                  │
        ┌─────────┴─────────┐
        NO                 YES
        │                   │
        ▼                   ▼
   Continua            Salva também
   normalmente         no Firestore
   (só local)          (sync cloud)
```

## Testando a Persistência Local

1. Marque alguns requisitos como completos
2. Feche a aba do navegador
3. Abra novamente
4. ✅ Seus dados estarão lá!

## Quando usar cada modo?

### Use Modo Local se:
- ✅ Você estuda sempre no mesmo dispositivo
- ✅ Não quer/precisa configurar Firebase
- ✅ Quer começar a usar imediatamente

### Use Modo Cloud se:
- ✅ Estuda no celular E no computador
- ✅ Quer backup automático na nuvem
- ✅ Quer garantir que nunca perderá dados

## Verificando seus dados

Abra o DevTools (F12) no navegador e vá em:
```
Application > Local Storage > http://localhost:3003
```

Você verá:
- `fluentbuddy_progress` - Seu progresso completo
- `fluentbuddy_chat_history` - Histórico de conversas

## Resumo

🎯 **Seu progresso NUNCA é perdido** - está sempre salvo no localStorage!

Firebase é apenas um **bônus opcional** para sync entre dispositivos.
