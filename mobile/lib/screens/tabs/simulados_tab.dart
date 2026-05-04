import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../../core/app_theme.dart';
import '../../providers/test_provider.dart';
import '../test_execution_screen.dart';
import '../../models/exam_models.dart';

class SimuladosTab extends StatefulWidget {
  const SimuladosTab({super.key});

  @override
  State<SimuladosTab> createState() => _SimuladosTabState();
}

class _SimuladosTabState extends State<SimuladosTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TestProvider>().loadAssignedTests();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<TestProvider>(
      builder: (context, testProvider, child) {
        if (testProvider.isLoading && testProvider.assignedTests.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        return ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('Simulados Disponíveis', style: Theme.of(context).textTheme.displayMedium),
                Text('Ver todos', style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.primary,
                  fontWeight: FontWeight.bold,
                )),
              ],
            ),
            const SizedBox(height: 16),
            if (testProvider.assignedTests.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Text('Nenhum simulado disponível no momento.', textAlign: TextAlign.center),
                ),
              ),
            ...testProvider.assignedTests.map((test) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: _buildSimuladoCard(context, test, testProvider),
              );
            }).toList(),
          ],
        );
      },
    );
  }
  Widget _buildSimuladoCard(BuildContext context, Test test, TestProvider testProvider) {
    final bool isDownloaded = testProvider.isTestDownloaded(test.id);
    final bool isDownloading = testProvider.isLoading && !isDownloaded; // simplistic check, ideally we have per-item loading state

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryContainer,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  (test.area ?? 'Geral').toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppTheme.onPrimaryContainer, fontSize: 10),
                ),
              ),
              if (isDownloaded)
                const Icon(Icons.download_done, color: AppTheme.success, size: 20)
              else
                const Icon(Icons.cloud_download_outlined, color: Colors.grey, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          Text(test.title, style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 4),
          Text('${test.timePerQuestion != null ? (test.timePerQuestion! * 10) ~/ 60 : 60} minutos estim.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          if (isDownloaded)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  await testProvider.startTest(test.id);
                  if (context.mounted) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const TestExecutionScreen(),
                      ),
                    );
                  }
                },
                child: const Text('Iniciar agora (Offline)'),
              ),
            )
          else if (kIsWeb)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final success = await testProvider.startTestOnline(test.id);
                  if (success && context.mounted) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const TestExecutionScreen(),
                      ),
                    );
                  } else if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Erro ao carregar simulado da internet.')),
                    );
                  }
                },
                child: isDownloading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Iniciar agora'),
              ),
            )
          else
            Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      final success = await testProvider.startTestOnline(test.id);
                      if (success && context.mounted) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const TestExecutionScreen(),
                          ),
                        );
                      } else if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Erro ao carregar simulado da internet.')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.secondary,
                      foregroundColor: Colors.white,
                    ),
                    child: isDownloading 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Iniciar Online Agora'),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () async {
                      final success = await testProvider.downloadTest(test.id);
                      if (success && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Simulado baixado com sucesso!')),
                        );
                      } else if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Erro ao baixar o simulado.')),
                        );
                      }
                    },
                    child: const Text('Baixar para Offline (Recomendado)'),
                  ),
                ),
              ],
            )
        ],
      ),
    );
  }
}
