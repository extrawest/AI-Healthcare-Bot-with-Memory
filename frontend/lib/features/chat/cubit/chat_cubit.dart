import 'dart:developer';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';

import '../models/chat_message.dart';
import '../models/llm_request.dart';
import '../repository/chat_repository.dart';
import 'chat_state.dart';

class ChatCubit extends Cubit<ChatState> {
  final ChatRepository repository;
  static const uuid = Uuid();
  final String _userId = const Uuid().v4();

  ChatCubit({
    required this.repository,
  }) : super(const ChatState());

  void sendMessage(String message) async {
    if (message.trim().isEmpty) return;

    // Add user message
    final messages = List<ChatMessage>.from(state.messages)..add(ChatMessage(role: 'user', content: message));

    emit(state.copyWith(
      messages: messages,
      status: ChatStatus.loading,
    ));

    try {
      final request = LLMRequest(
        userMessage: message,
        userId: _userId,
      );

      await for (final response in repository.streamChat(request: request)) {
        log('Received response: $response');
        final messages = List<ChatMessage>.from(state.messages)..add(ChatMessage.fromMap(response));

        emit(state.copyWith(
          messages: messages,
          status: ChatStatus.success,
        ));
      }
    } catch (e) {
      final messages = List<ChatMessage>.from(state.messages)..add(ChatMessage(role: 'error', content: 'Error: $e'));

      emit(state.copyWith(
        messages: messages,
        status: ChatStatus.error,
        errorMessage: e.toString(),
      ));
    }
  }
}
