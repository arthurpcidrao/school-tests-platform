# Guia do Mobile: Flutter (App do Aluno)

O aplicativo mobile foi concebido em linguagem **Dart** e estruturado no robusto framework multiplataforma **Flutter**. Seu foco difere inteiramente da plataforma Web; o mobile existe unicamente para sustentar a experiência primária de realização de testes (O "front de batalha") garantindo a imersão e integridade do processo para o Aluno.

Ele é fortemente caracterizado por um design de arquitetura "Offline-First", onde a ausência contínua ou quedas momentâneas de rede na sala de aula não interfiram ou impeçam a finalização do simulado.

Este guia orienta tecnicamente sobre como as peças do aplicativo se comportam sob a perspectiva arquitetural e do fluxo de rede.

## 1. Especificações do Mobile e a Abordagem Offline-First (SQLite Local)

A robustez da resiliência local do aplicativo é sustentada por um banco de dados relacional contido integralmente no hardware do dispositivo do próprio aluno.

**Como funciona a base local embarcada?**
A aplicação incorpora o pacote `sqflite` (configurado em `lib/database_helper.dart`). 
O mecanismo atua como um espelho local e temporário das tabelas cruciais de domínio que vivem no PostgreSQL (backend cloud).
- Assim que o aplicativo é inicializado em uma área com conectividade ativa com a internet, o Flutter varre a base de dados em nuvem através de nossas rotas de API, faz o download estruturado das tabelas (provas ativas, textos das perguntas correspondentes e matrizes de alternativas), e escreve isso na memória interna/SQLite do celular.
- Essa arquitetura assegura que no momento em que o aluno toca em "Iniciar Simulado" (ativando a `TestExecutionScreen`), **o app não dependerá de chamadas externas ou internet de forma ativa** para carregar a próxima pergunta.
- Durante a prova, o banco celular (SQLite) registra isoladamente a progressão das respostas. A cada alteração o registro interno recebe a flag booleana `synced=0`.
- Imediatamente após a finalização real da prova e/ou a detecção ativa da reinstabilidade da rede (via listener `connectivity_plus`), uma rotina silenciosa despacha as respostas para o backend real marcando em seguida o campo para `synced=1` a fim de consolidar que aquela informação já foi garantida pelo Django e prevenir envios duplicados.

## 2. Como o aplicativo se conecta aos Servidores (Backend)?

Toda a infraestrutura em volta das conversas com a internet acontece dentro de diretórios de serviço de dados (`lib/services/`), impedindo a poluição de código dentro da interface visual.

**A Interface HTTP com o Backend Django Ninja (`api_service.dart`)**
Usamos extensivamente a biblioteca de requisições `Dio`. Esse arquivo detém o mapa de conexão com a infraestrutura Web. Ele guarda a Base URL do ambiente (seja via localhost em emuladores 10.0.2.2 ou produção na web).
Sua missão primordial é acionar os endpoins do sistema, por exemplo, executando o POST no método `submitTestResults` que envelopa todas as respostas da prova num JSON estruturado e as atira de volta para a nuvem.
Ele também atua como um Middleware nativo de Autenticação, recuperando instantaneamente os Tokens JWT armazenados no disco seguro (`flutter_secure_storage`) para inserir os cabeçalhos em cada nova chamada de rede - certificando ao backend que o remetente é um aluno qualificado.

## 3. Dinâmica das Provas e "Indisponibilidade" Pós-Teste (Sincronização)

O App mobile está sujeito a restrições que operam em total orquestração com as regras do banco de dados centralizado. Um dos fluxos mais vitais é evitar retentativas não planejadas das provas.

**A mecânica de comunicação anti-repetição:**
1. **O Acionamento Final:** O aluno conclui as pendências do teste na tela em Flutter. Ao clicar em finalizar prova, o mobile compacta suas escolhas numa única lista coesa e utiliza o pacote HTTPS do `Dio` para a remessa imediata para a API do backend de salvamento daquela ID de Prova.
2. **Homologação Backend (PostgreSQL):** O cérebro do sistema Web recebe e calcula a prova, carimbando definitivamente na sua tabela oficial de histórico de finalizações a entidade atrelada aquele simulado para o perfil daquele estudante (ex: status `completed` em `test_attempts`).
3. **Restrição por Design no App:** Daquele milissegundo em diante, toda vez que o estudante abrir a "Aba de Simulados Disponíveis" ou solicitar o puxamento contínuo (Refresh) da tela, o pacote recebido via API (`/api/exams/tests/available`) irá ocultar aquela prova, não enviando-a mais como conteúdo alcançável para o aplicativo do discente. 

A união dessa técnica no fluxo de rede extingue a chance de uma prova finalizada ser retentada. E, consequentemente, a avaliação passa a aparecer no relatório histórico de Desempenho onde os resultados detalhados (acertos vs totais) são servidos num endpoint focado apenas em exames finalizados.

## 4. Onde está Organizado o App?

A área de operações em Flutter é englobada completamente dentro do diretório `/lib`. O que foge dessa hierarquia é majoritariamente códigos fontes focados na configuração e compilação das plataformas nativas Android/iOS.

- `lib/main.dart`: É o ponto gravitacional que inicia a compilação do fluxo global do material. Ele invoca os dados assíncronos e realiza a predição para saber se o usuário detêm tokens válidos no aparelho ou se necessita ser arremessado à `LoginScreen`.
- `lib/core/` (Coração Técnico): Aloca tipificações constantes como o `app_theme.dart` centralizador do Design, chaves de autenticação, cores universais.
- `lib/providers/` (A Reatividade e Gestão Global do Estado): A ferramenta fundamental de trabalho. A aplicação foi montada usando padrão **Provider**. 
  - `auth_provider.dart`: Armazena a inteligência e orquestração de Login, validação segura com o app, e deslogamento em falhas sistêmicas.
  - `test_provider.dart`: A mente central por trás da execução da prova na tela. Detém a responsabilidade crítica dos sistemas *anti-fraude*, utilizando-se de listeners da plataforma nativa (AppLifecycleState). Caso o Provider constate que o estudante minimizou a prova com ela em curso, o relógio temporal acelera o desligamento arbitrário do fluxo finalizando e penalizando o teste automaticamente.
- `lib/screens/` (Telas Exibidas): Todo o invólucro gráfico em Widgets puros de Flutter. 
  - Aqui concentram-se a tela cheia base, como o `dashboard_screen.dart` (a fundação que inclui a persistente Navigation Bar com abas laterais) bem como os arquivos fracionados alocados na subpasta `tabs/` correspondentes às visualizações de catálogo de prova disponíveis e métricas conclusivas de desempenho do avaliado.
