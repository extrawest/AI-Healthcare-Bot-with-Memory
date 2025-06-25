import 'package:flutter/material.dart';

import '../models/chat_message.dart';

({Color? color, Alignment alignment}) getMessageStyle(ChatMessage message) {
  switch (message.role) {
    case 'user':
      return (
        color: Colors.blue[100],
        alignment: Alignment.centerRight,
      );
    case 'assistant':
      return (
        color: Colors.grey[200],
        alignment: Alignment.centerLeft,
      );
    case 'error':
      return (
        color: Colors.red[50],
        alignment: Alignment.center,
      );
    default:
      return (
        color: Colors.grey[100],
        alignment: Alignment.center,
      );
  }
}
