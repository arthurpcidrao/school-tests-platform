import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/test_provider.dart';
import '../../core/app_theme.dart';

class TestExecutionScreen extends StatefulWidget {
  const TestExecutionScreen({super.key});

  @override
  State<TestExecutionScreen> createState() => _TestExecutionScreenState();
}

class _TestExecutionScreenState extends State<TestExecutionScreen> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final provider = context.read<TestProvider>();
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      provider.onAppPaused();
    } else if (state == AppLifecycleState.resumed) {
      provider.onAppResumed();
    }
  }

  String _formatTime(int totalSeconds) {
    int minutes = totalSeconds ~/ 60;
    int seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TestProvider>();

    // Tratar tela de bloqueio (Fraude)
    if (provider.isBlocked) {
      return Scaffold(
        backgroundColor: AppTheme.danger,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.warning_rounded, color: Colors.white, size: 80),
                const SizedBox(height: 24),
                Text(
                  'Prova Interrompida',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'Foi detectada uma violação das regras de execução (saída do aplicativo). O simulado foi bloqueado e enviado com as respostas até o momento.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.danger,
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: const Text('Voltar ao Início'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (provider.isLoading || provider.questions.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final question = provider.currentQuestion;
    final items = provider.currentItems;
    final selectedAnswer = provider.currentSelectedAnswer;
    final totalQuestions = provider.questions.length;
    final currentIndex = provider.currentQuestionIndex;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.primaryContainer,
        foregroundColor: AppTheme.onPrimaryContainer,
        title: Text(provider.activeTest?.title ?? 'Simulado'),
        centerTitle: true,
        automaticallyImplyLeading: false, // Ocultar botão de voltar para evitar saída acidental
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    _formatTime(provider.remainingSeconds),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Barra de Progresso
          LinearProgressIndicator(
            value: provider.progressPercentage,
            backgroundColor: AppTheme.border,
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.success),
            minHeight: 6,
          ),
          
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(24.0),
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        'Questão ${currentIndex + 1} de $totalQuestions',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Enunciado
                Text(
                  question?.stem ?? '',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    height: 1.6,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 32),
                
                // Alternativas
                ...items.map((item) {
                  final isSelected = selectedAnswer == item.id;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: InkWell(
                      onTap: () => provider.selectAnswer(item.id),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected ? AppTheme.primary.withOpacity(0.05) : AppTheme.surface,
                          border: Border.all(
                            color: isSelected ? AppTheme.primary : AppTheme.border,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected ? AppTheme.primary : AppTheme.border,
                                  width: 2,
                                ),
                              ),
                              child: isSelected 
                                ? Center(
                                    child: Container(
                                      width: 12,
                                      height: 12,
                                      decoration: const BoxDecoration(
                                        color: AppTheme.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  )
                                : null,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                item.text,
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ],
            ),
          ),
          
          // Rodapé (Navegação)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                )
              ]
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton.icon(
                  onPressed: currentIndex > 0 ? provider.previousQuestion : null,
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Anterior'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppTheme.primary,
                  ),
                ),
                
                if (currentIndex < totalQuestions - 1)
                  ElevatedButton.icon(
                    onPressed: provider.nextQuestion,
                    icon: const Icon(Icons.arrow_forward),
                    label: const Text('Próxima'),
                  )
                else
                  ElevatedButton.icon(
                    onPressed: () {
                      _showSubmitConfirmation(context, provider);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.success,
                      foregroundColor: Colors.white,
                    ),
                    icon: const Icon(Icons.check),
                    label: const Text('Finalizar Prova'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showSubmitConfirmation(BuildContext context, TestProvider provider) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Entregar Simulado?'),
        content: const Text('Tem certeza que deseja finalizar e enviar suas respostas? Você não poderá alterá-las depois.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Revisar Prova'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
            onPressed: () async {
              Navigator.pop(ctx); // fecha modal
              // TODO: Mostrar tela de loading
              showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: CircularProgressIndicator()));
              
              final success = await provider.submitTest();
              if (context.mounted) {
                Navigator.pop(context); // fecha loading
                if (success) {
                  Navigator.pop(context); // Volta pro Dashboard
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Simulado enviado com sucesso!')),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Erro ao enviar simulado. Verifique a internet.')),
                  );
                }
              }
            },
            child: const Text('Sim, entregar'),
          ),
        ],
      ),
    );
  }
}
