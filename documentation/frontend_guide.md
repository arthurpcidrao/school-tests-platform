# Guia do Frontend Web: Next.js (Web/Professor)

O frontend foi construído em **React** utilizando o framework **Next.js** (App Router). Ele é primariamente focado no ambiente do professor e painéis administrativos da plataforma EdukSim.

## Onde estão as páginas?

Com a nova arquitetura do App Router do Next.js, as rotas e páginas vivem dentro do diretório `frontend/app/`. Cada subpasta se torna uma rota acessível via URL, e o arquivo contendo a interface visual é sempre o `page.tsx`.

- **`/` (Raiz):** Fica em `app/page.tsx` (Página de aterrissagem/Home).
- **`/login`:** Fica em `app/login/page.tsx` (Tela de autenticação tradicional e botão de login com Google).
- **`/dashboard`:** Fica em `app/dashboard/page.tsx` (Painel interno do professor onde ele vê métricas, provas criadas e dados de simulados).

Dentro do diretório raiz do `app/`, você também encontra o `layout.tsx`, que é o "molde" principal que envolve todas as outras páginas (por exemplo, onde importamos fontes, injetamos provedores globais como o `GoogleOAuthProvider`, etc).

## Onde estão os componentes?

Os componentes reutilizáveis que compõem essas páginas ficam organizados na pasta `frontend/components/`. 
Nesta pasta, o código geralmente é quebrado em partes menores:
- Pode haver botões, modais, cards de estatísticas, tabelas de listagem de provas, entre outros blocos reutilizáveis.

## Sobre a Biblioteca de Componentes

**Sim.** Estamos utilizando e configuramos no projeto a biblioteca **shadcn/ui** juntamente com o TailwindCSS, além de bibliotecas subjacentes que dão suporte a ele (como `lucide-react` para os ícones, `class-variance-authority`, `tailwind-merge` e `clsx`). Isso permite interfaces modernas e esteticamente agradáveis seguindo os padrões que construímos.
