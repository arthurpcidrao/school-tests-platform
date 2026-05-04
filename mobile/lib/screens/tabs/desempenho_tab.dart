import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../services/api_service.dart';
import 'package:intl/intl.dart';

class DesempenhoTab extends StatelessWidget {
  const DesempenhoTab({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: ApiService.instance.fetchMyAttempts(),
      builder: (context, AsyncSnapshot snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final List attempts = snapshot.hasData && snapshot.data.statusCode == 200 
            ? snapshot.data.data 
            : [];

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
            if (attempts.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Text(
                    'Nenhum histórico disponível ainda. Faça seu primeiro simulado!',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              ...attempts.map((att) {
                final score = att['score_percentage'] as num;
                final correct = att['correct_count'];
                final total = att['total_count'];
                final dateStr = att['finished_at'];
                
                String dateFormatted = '';
                if (dateStr != null) {
                  try {
                    dateFormatted = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(dateStr));
                  } catch (_) {}
                }

                Color color = AppTheme.success;
                IconData icon = Icons.check_circle_outline;
                if (score < 50) {
                  color = AppTheme.danger;
                  icon = Icons.cancel_outlined;
                } else if (score < 70) {
                  color = AppTheme.warning;
                  icon = Icons.info_outline;
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: _buildHistoryItem(
                    context, 
                    att['test_title'], 
                    dateFormatted, 
                    '${score.toStringAsFixed(1)}%', 
                    '$correct / $total', 
                    color, 
                    icon
                  ),
                );
              }).toList(),
          ],
        );
      }
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
