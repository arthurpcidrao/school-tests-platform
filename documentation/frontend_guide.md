# Guia do Frontend Web: Next.js (Web/Professor)

O frontend foi construído em **React** utilizando a maturidade e a performance do framework **Next.js** (na sua estrutura mais moderna utilizando o App Router). 

Ele atua estritamente como o "painel de controle" administrativo e pedagógico da plataforma EdukSim, sendo a ferramenta primária e exclusiva de gestão acessada pelos Professores, Diretores e Coordenação da Escola a partir de computadores e notebooks.

Este guia serve para navegar pela forma em que as páginas e componentes interagem, e detalhar a finalidade de cada rota exposta.

## 1. Mapeamento das Rotas e Páginas (Frontend Routes)

Na arquitetura do App Router do Next.js, as rotas vivem na hierarquia do diretório raiz `frontend/app/`. Diferente do antigo roteamento onde cada arquivo se tornava uma rota, aqui o Next.js emprega o "Roteamento baseado em Pastas", o que significa que se criarmos uma pasta `dashboard` e lá dentro incluirmos o arquivo mágico com o nome obrigatório `page.tsx`, o sistema entende a criação da Rota Pública `/dashboard`.

Abaixo apresentamos as rotas web construídas e a especificação de cada um de seus papéis:

- **`/` (Rota Raiz - Landing Page):** 
  - Fica localizada em `app/page.tsx`. Esta é a página de aterrissagem pública. Sua finalidade é ser a vitrine do sistema, apresentando informações gerais da ferramenta e redirecionando o educador ao portal de entrada apropriado.

- **`/login` (Tela de Acesso):** 
  - Fica localizada em `app/login/page.tsx`. Ponto de entrada protegido, exibe os modais de autenticação tradicional (email e senha) e os atalhos de autenticação OAuth2 (Botões do Google). A lógica dessa página se comunica estritamente com os endpoints `/api/auth/` do nosso Backend.

- **`/register` (Cadastro Institucional):** 
  - Fica localizada em `app/register/page.tsx`. É a página que acomoda o longo formulário de entrada para novos professores e perfis administrativos.

- **`/dashboard` (Painel Geral e Relatórios):** 
  - Fica localizada em `app/dashboard/page.tsx`. Este é o coração do monitoramento contínuo da escola. Trata-se de uma tela interna blindada (sem um login JWT em sessão válida o Next.js barrará o acesso). Nela o professor consome estatísticas globais, visualiza a contagem total de alunos ativos cadastrados no seu sistema e varre o histórico de provas lançadas por ele ou pela instituição.

- **`/dashboard/create-test` (Motor de Criação de Simulado):** 
  - Sub-rota poderosa contendo todo o formulário de montagem das provas. O professor define os metadados (Título e Limite de Tempo por questão), tem a possibilidade de navegar e adicionar itens arquivados no Banco de Questões Global da Escola, ou até mesmo gerar perguntas inéditas no mesmo instante. Antes de finalizar o workflow e acionar o salvamento, a página exige a demarcação precisa de quais alunos, listas ou turmas irão participar da avaliação, direcionando essa carga de dados estruturada (JSON) para a API do backend.

- **`/dashboard/create-question` (Abastecimento de Banco):** 
  - Rota de uso rápido, criada para simplificar a alimentação de questões soltas (inserir cabeçalho, resposta correta e incorretas) avulsamente, populando diretamente o acervo do banco de dados escolar sem vinculá-las a uma prova imediatamente.

> **O Papel Subjacente do arquivo `layout.tsx`:** 
> Dentro da raiz `app/` (e potencialmente aninhada na pasta de rotas administrativas) existe o construtor "mãe" da interface chamado `layout.tsx`. Esse arquivo existe ao redor dos `page.tsx` para evitar recarregamento indevido. O layout é estático. É graças a ele que a Barra Lateral do painel (Sidebar), o import das fontes oficiais (Lexend e Inter), os provedores contextuais (ThemeProviders e AuthProviders), mantêm-se constantes, independentemente de você estar em `/dashboard` ou transitar para `/dashboard/create-test`.

## 2. Onde estão e como organizamos os Componentes?

O fluxo visual de rotas fica sustentado na pasta `frontend/components/`. A fim de manter o código altamente coeso e manutenível, nós abstraímos quase qualquer bloco visual da tela e transformamos em componentes em React.

Eles estão segregados por função na sua taxonomia:
- **Componentes Basais (Design System):** Isolados primariamente na subpasta `ui/`, abrigam estruturas que repetem padrões de projeto - botões padrões do sistema, labels, campos de entrada formatados (inputs textuais), switches, barras de navegação entre outros.
- **Componentes de Domínio:** Fragmentos complexos dotados de sua própria lógica leve, como por exemplo, um Card Estatístico Dinâmico exibido no painel de administração e o modal (Dialog) interativo para seleção simultânea de múltiplos alunos em tela, que formam grandes tabelas.

## 3. Padrão Tecnológico Utilizado na Estilização

O projeto adota uma biblioteca híbrida de componentes avançados chamada **shadcn/ui** orquestrada por classes do **TailwindCSS** (v4).

Diferente de frameworks monolíticos (como o Bootstrap ou Material UI) o shadcn se instala copiando o código primitivo do componente para dentro da sua pasta `components/ui/`, permitindo o total acoplamento da estilização na folha global de design (`globals.css`) para gerir perfeitamente as cores temas (como nosso "Primary Color": `#0054cb`), fontes e bordas suaves, enquanto garante toda a acessibilidade por meio do core RadixUI e uma vasta biblioteca moderna de ícones com `lucide-react`.
