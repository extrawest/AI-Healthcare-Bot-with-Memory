import 'package:equatable/equatable.dart';

class ChatMessage extends Equatable {
  final String role;
  final String content;

  const ChatMessage({
    required this.role,
    required this.content,
  });

  @override
  List<Object?> get props => [role, content];

  Map<String, String> toMap() => {
        'role': role,
        'content': content,
      };

  factory ChatMessage.fromMap(Map<String, String> map) => ChatMessage(
        role: map['type'] ?? map['role'] ?? 'unknown',
        content: map['content'] ?? '',
      );
}
