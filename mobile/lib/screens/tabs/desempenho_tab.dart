import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class DesempenhoTab extends StatelessWidget {
  const DesempenhoTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Text('Histórico de Desempenho', style: Theme.of(context).textTheme.displayMedium),
            ),
            const Icon(Icons.history, color: AppTheme.textSecondary),
          ],
        ),
        const SizedBox(height: 24),
        _buildHistoryItem(
          context,
          'Biologia Celular - Módulo 1',
          'Finalizado em 12 Out',
          '85%',
          '34/40',
          AppTheme.success,
          Icons.check_circle,
        ),
        const SizedBox(height: 12),
        _buildHistoryItem(
          context,
          'Química Orgânica - Reações',
          'Finalizado em 10 Out',
          '62%',
          '15/25',
          AppTheme.warning,
          Icons.error,
        ),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF00409f), // on-primary-fixed-variant from HTML
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primary.withOpacity(0.3),
                blurRadius: 15,
                offset: const Offset(0, 8),
              )
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Reforço Necessário',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
              ),
              const SizedBox(height: 8),
              Text(
                'Baseado nos seus erros recentes, foque nestes temas:',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white.withOpacity(0.8)),
              ),
              const SizedBox(height: 16),
              _buildReforcoItem(context, 'Física', 'Leis de Newton', AppTheme.warning, Icons.lightbulb),
              const SizedBox(height: 8),
              _buildReforcoItem(context, 'História', 'Brasil Colônia', const Color(0xFF6bd3fd), Icons.psychology),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryItem(BuildContext context, String title, String subtitle, String pct, String raw, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(pct, style: Theme.of(context).textTheme.titleLarge?.copyWith(color: color, fontWeight: FontWeight.bold)),
              Text(raw, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReforcoItem(BuildContext context, String tag, String subject, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tag.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color, fontSize: 10),
              ),
              Text(
                subject,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
