# Documentação do KanbanClient

## Visão Geral

O **KanbanClient** é uma aplicação híbrida desktop/web para controle de produção, especialmente adaptada para a linha de embalagens de pano da Pracafé.

### Principais funcionalidades

- Cadastro e gerenciamento de pedidos de produção.
- Controle de progresso com barra visual e estados (Pendente, Produzindo, Concluído).
- Suporte a previsões com IA via Google Gemini.
- Geração de relatórios/PDF.
- Sincronização de dados entre SQLite local e LocalStorage.

---

## Requisitos de instalação

- Node.js 18 ou superior (recomendado Node 20 LTS).
- npm 10 ou superior.
- Git para clonar o repositório.
- Espaço em disco suficiente para dependências e build.
- Conexão com a internet para baixar dependências.
- Opcional: chave de API Google Gemini se ativar recursos de IA (opcional para funcionalidades básicas).

> Observação: para execução em modo Electron, a plataforma Windows 10/11 é suportada. A aplicação também pode rodar em Linux, mas os testes foram realizados principalmente no Windows.

---

## Instalação passo a passo

1. Clone o repositório:

```bash
git clone <repo>
cd KANBANCLIENT
```

2. Instale dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente na raiz do projeto:

```text
VITE_GEMINI_API_KEY=your_key
```

4. Compile os arquivos Electron TypeScript:

```bash
npm run build:electron
```

5. Execute em modo desenvolvimento Electron:

```bash
npm run electron:dev
```

6. Para gerar o build de produção do Electron:

```bash
npm run electron:build
```

7. Se desejar rodar apenas o front-end React:

```bash
npm run react:dev
```

8. Para visualizar a versão pré-compilada do Vite:

```bash
npm run preview
```

---

## Scripts importantes

- `npm run react:dev` - executa o front-end React localmente.
- `npm run build:electron` - compila `electron/main.ts` e `electron/preload.ts` para JavaScript.
- `npm run electron:dev` - inicia o Electron em modo de desenvolvimento.
- `npm run electron:build` - gera o instalador/versão de produção via `electron-builder`.
- `npm run preview` - visualiza o build do Vite.

---

## Erros comuns e correções

### 1. Unable to find Electron app ... electron/main.js

Causa: o Electron não encontrou o arquivo gerado `electron/main.js`.

Correção:

```bash
npm run build:electron
npm run electron:dev
```

### 2. Não foi possível localizar o arquivo de declaração para o módulo 'react'

Causa: falta o pacote de tipos do React.

Correção:

```bash
npm install --save-dev @types/react @types/react-dom
```

### 3. JSX implícito tem tipo 'any'

Causa: configuração TypeScript não reconhece a sintaxe JSX ou os tipos React.

Correção:

- Verifique `tsconfig.json`
- Confirme que existe:

```json
"jsx": "react-jsx"
```

### 4. Erro de login

Causa: credenciais inválidas no formulário de login.

Credenciais válidas atuais:

- `Tulio` / `124578`
- `User` / `User`

### 5. Falha ao gerar build de produção

Causa: o build do Electron precisa compilar primeiro os arquivos TypeScript.

Correção:

```bash
npm run build:electron
npm run electron:build
```

---

## Observações de configuração

- O `main` do `package.json` aponta para `electron/main.js`.
- O `tsconfig.electron.json` foi adicionado para compilar apenas os arquivos Electron.
- A interface de preload é exposta em `window.electronAPI`.

---

## Atualização

Documento atualizado em: 05/05/2026
