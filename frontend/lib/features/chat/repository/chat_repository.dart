import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/llm_request.dart';
import '../services/chat_service.dart';

abstract class ChatRepository {
  final ChatApiService chatApiService;

  ChatRepository(this.chatApiService);

  Stream<Map<String, String>> streamChat({
    required LLMRequest request,
  });
}

class ChatRepositoryImpl implements ChatRepository {
  @override
  final ChatApiService chatApiService;

  ChatRepositoryImpl({required this.chatApiService});

  @override
  Stream<Map<String, String>> streamChat({
    required LLMRequest request,
  }) {
    return chatApiService.streamChat(request);
  }
}
