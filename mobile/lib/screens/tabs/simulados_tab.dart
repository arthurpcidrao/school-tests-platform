import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class SimuladosTab extends StatelessWidget {
  const SimuladosTab({super.key});

  @override
  Widget build(BuildContext context) {
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
        _buildSimuladoCard(
          context,
          'Matemática',
          'Cálculo Diferencial II',
          '40 questões • 120 minutos',
          AppTheme.primaryContainer,
          AppTheme.onPrimaryContainer,
        ),
        const SizedBox(height: 16),
        _buildSimuladoCard(
          context,
          'Português',
          'Interpretação Textual',
          '25 questões • 60 minutos',
          AppTheme.secondary,
          Colors.white,
        ),
      ],
    );
  }

  Widget _buildSimuladoCard(BuildContext context, String tag, String title, String subtitle, Color tagBg, Color tagText) {
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
                  color: tagBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  tag.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(color: tagText, fontSize: 10),
                ),
              ),
              const Icon(Icons.more_vert, color: Colors.grey),
            ],
          ),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.displaySmall),
          const SizedBox(height: 4),
          Text(subtitle, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // TODO: Navegar para DoTestScreen
              },
              child: const Text('Iniciar agora'),
            ),
          )
        ],
      ),
    );
  }
}
