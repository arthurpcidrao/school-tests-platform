# Especificação Mobile - Flutter (Dart)

## Pasta mobile:
- school-tests-platform/mobile

## UX e Regras de Negócio
1. **Login Aluno:** Via Google Sign-In ou JWT.
2. **Dashboard do Aluno:**
   - Aba "Disponíveis": Simulados no prazo de validade.
   - Aba "Desempenho": Resultados anteriores e "O que melhorar".

## Mecanismo de Prova (Crítico)
1. **Offline-First:**
   - Ao iniciar, o App faz cache local (`sqflite`) do JSON da prova e imagens.
   - Cronômetro gerido por `Service` em background.
2. **Segurança (Anti-Fraude):**
   - **App Locking:** Monitorar o ciclo de vida do app (`AppLifecycleState`).
   - **Tolerância:** Permitir saída do app por no máximo 10 segundos. Se exceder, a prova é marcada para revisão ou bloqueada.
3. **Sincronização:**
   - Utilizar `connectivity_plus`. Ao detectar rede, enviar respostas pendentes.