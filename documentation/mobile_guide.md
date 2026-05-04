# Guia do Mobile: Flutter (App do Aluno)

O aplicativo mobile foi construído usando **Flutter** e a linguagem **Dart**. Ele é focado na experiência do Aluno: realizar testes offline-first, sincronizar respostas com o servidor e checar o desempenho de suas notas.

Se essa é a sua primeira vez com Flutter, não se preocupe! O Flutter constrói tudo a partir de "Widgets" (que são como componentes do React) e é altamente focado na reatividade.

## Como o código está disposto?

Dentro de `mobile/`, o diretório de trabalho onde o código inteiro existe é a pasta `lib/`.

- `lib/main.dart`: É o ponto de entrada principal de todo o aplicativo. Onde ele inicia, checa se o aluno já está logado, e redireciona para a tela de Login ou Dashboard.
- `lib/core/`: Coisas globais. Aqui temos, por exemplo, `app_theme.dart` (onde definimos cores primárias, tamanhos de fonte, para o design ficar unificado).
- `lib/providers/`: É onde a "mágica dos dados" acontece no Frontend Mobile (Gerência de Estado). Usamos o pacote `provider` para armazenar o estado global e compartilhar entre telas. Por exemplo:
  - `auth_provider.dart`: Lida com tokens, saber se o usuário está carregando algo ou se o login falhou.
  - `test_provider.dart`: Lida com provas offline, mecanismo anti-fraude (sair do aplicativo) e sincronização.
- `lib/services/`: Onde fazemos comunicação com coisas de fora do app.
  - `api_service.dart`: Usa a biblioteca `Dio` para fazer requisições HTTP para a API do backend (Django Ninja). Se você precisar buscar algo em um novo endpoint do backend, você adiciona um método aqui.
- `lib/screens/`: As telas inteiras visíveis para o aluno.
  - `login_screen.dart`: A tela padrão inicial.
  - `dashboard_screen.dart`: A "casca" principal após o login que contém o menu inferior de navegação (NavigationBar).
  - Subpasta `tabs/`: Pedaços do Dashboard, como `simulados_tab.dart` (onde ele vê as provas disponíveis) e `desempenho_tab.dart` (onde vê as notas finais).

## Se eu precisar editar algo, onde eu vou?

1. **Alterar as cores ou fonte do app:** Vá em `lib/core/app_theme.dart`.
2. **Adicionar um botão ou mudar o texto de uma tela:** Vá em `lib/screens/` e abra o arquivo correspondente da tela (ex: `login_screen.dart`). O visual do Flutter fica dento do bloco chamado `Widget build(BuildContext context) { ... }`.
3. **Fazer o aplicativo conversar com uma NOVA rota do backend:**
   - Primeiro, abra o `lib/services/api_service.dart` e crie a chamada (usando `_dio.get(...)` ou `_dio.post(...)`).
   - Depois, abra o Provider associado em `lib/providers/` (ou crie um novo) e use sua chamada no `api_service` para transformar os dados em variáveis de estado (como carregar listas ou mostrar mensagens de erro).
   - Por último, use esse Provider na sua interface visual.
4. **Remover uma funcionalidade de uma tela:** Assim como no React, basta encontrar o Widget (ex: um `ElevatedButton`) dentro de `lib/screens/` e apagá-lo.

Lembre-se: Após alterar qualquer arquivo no Flutter, você pode salvar (Ctrl+S) e o simulador será atualizado imediatamente (Hot Reload).
