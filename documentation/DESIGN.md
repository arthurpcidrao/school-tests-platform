# Design de telas (EdukSim)

## O que é o Sistema?
O sistema é uma plataforma SaaS WEB e um aplicativo mobile para a criação e realização de provas escolares de forma simples e segura.

## Objetivo do SaaS
O objetivo do SaaS é automatizar o ciclo de vida de simulados escolares e académicos. A plataforma resolve dois problemas principais: a facilidade de fraude (através do embaralhamento dinâmico) e a sobrecarga de correção dos professores (através de automação e IA).

## Usuários
O sistema possui dois tipos de usuários: Professor e Aluno

## Paleta de cores
- Primary: #2b73fa
- Secondary: #68d0fa
- Tertiary: #eebba1
- Success: #2ecc71
- Warning: #f1c40f
- Danger: #e74c3c
- Background: #F4F4F9
- Text: #333333

## Regras Gerais
- É necessário que os sistemas estejam todos com a mesma paleta de cores
- Os componentes devem ser responsivos
- O sistema deve ser acessível
- Não utilizar qualquer biblioteca que possa comprometer a segurança ou a privacidade dos dados

## Icones:
- Para a web, usar os ícones do site https://ui.shadcn.com/
- Para mobile (flutter), usar os ícones do site https://fonts.google.com/icons


## Tecnologias
- **Frontend WEB:** Next.js
- **Frontend Mobile:** Flutter
- **Backend:** Django Ninja
- **Banco de Dados:** PostgreSQL

## Design das Telas

### Tela de Login
Essa tela deve identificar o usuário como professor ou aluno no momento do login. Após o login, deve redirecioná-lo para a tela apropriada.
- Formulário com campos de email e senha.
- Botão de login.
- Link de cadastro.

### Tela de Cadastro
- Formulário com campos de nome, se o usuário é professor ou aluno, email e senha.
- Botão de cadastro.

### Tela de Dashboard
Dependendo do tipo do usuário (professor ou aluno), deve exibir uma lista de simulados (professor) ou uma lista de simulados disponíveis para realização (aluno).
- No caso de Professores, um dashboard com métricas agregadas:
    - Lista de simulados criados.
    - Desempenho nos simulados finalizados.
    - Assuntos com maior dificuldade entre os alunos.
    - Botão de criar simulado.
- No caso de Alunos, um dashboard com métricas agregadas:
    - Lista de simulados disponíveis para realização.
    - Desempenho nos simulados realizados.
    - Assuntos com maior dificuldade.

### Tela de Criação de Simulado (professor)
- Espaço para escrever o nome do simulado
- Espaço para escrever a descrição do simulado
- Botão de criar questões
    - Ao clicar, deve ter um espaço para enunciado, 
    - escolher o tipo de questão (Discursivas ou Objetivas)
        - ao ser fechada, ter espaço para criar alternativas e escolher a correta
        - ao ser aberta, ter espaço para definir palavras-chave para correção automática
    - definir o peso da questão
    - Botão de salvar a questão
    - Botão de cancelar a questão
- Deve poder selecionar o tempo do simulado e, caso queira, o tempo por questão
- Deve poder selecionar a data de início e fim do simulado
- Deve poder selecionar a lista de alunos que terão acesso ao simulado
- Botão de salvar simulado

### Tela de Realização de Simulado (aluno)
Essa tela é específica do aluno e deve ser implementada no Flutter. Na tela do dispositivo, terá somente a questão atual.

Caso seja feito na web, deve ter a lista de questões ao lado, com a questão atual destacada.

- Ao entrar no simulado, deve baixar os dados do simulado para o dispositivo mobile
- Botão de avançar e voltar entre as questões
- Ao terminar o simulado, deve enviar as respostas para o backend
-Contador de tempo
