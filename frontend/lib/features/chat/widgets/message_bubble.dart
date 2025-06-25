import 'package:flutter/material.dart';

import '../models/chat_message.dart';
import '../utils/chat_utils.dart';

class MessageBubble extends StatelessWidget {
  final ChatMessage message;

  const MessageBubble({
    super.key,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    final style = getMessageStyle(message);

    return Align(
      alignment: style.alignment,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: style.color,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (message.role != 'user' && message.role != 'assistant')
              Text(
                message.role.toUpperCase(),
                style: TextStyle(
                  fontSize: 10,
                  color: message.role == 'error' ? Colors.red : Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
            Text(message.content),
          ],
        ),
      ),
    );
  }
}
