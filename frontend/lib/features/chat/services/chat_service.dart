import 'dart:convert';
import 'dart:developer';

import 'package:http/http.dart' as http;

import '../models/llm_request.dart';

const baseUrl = 'http://localhost:2024';

class ChatApiService {
  ChatApiService();

  Stream<Map<String, String>> streamChat(LLMRequest llmRequest) async* {
    final client = http.Client();
    try {
      log('Creating request to: $baseUrl/runs/stream');
      final streamRequest = http.Request('POST', Uri.parse('$baseUrl/runs/stream'));
      streamRequest.headers.addAll({
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      final requestBody = {
        'assistant_id': 'fe096781-5601-53d2-b2f6-0d3403f7e9ca',
        'input': {
          'messages': [
            {
              'content': llmRequest.userMessage,
              'additional_kwargs': {'userId': llmRequest.userId},
              'type': 'human'
            }
          ]
        },
        'streamMode': 'values'
      };
      streamRequest.body = jsonEncode(requestBody);

      final response = await client.send(streamRequest);
      log('Response status code: ${response.statusCode}');

      if (response.statusCode != 200) {
        yield {'type': 'error', 'content': 'Failed to send message: ${response.statusCode}'};
        return;
      }

      String eventBuffer = '';
      String dataBuffer = '';
      bool isCollectingData = false;

      await for (var chunk in response.stream.transform(utf8.decoder)) {
        final lines = chunk.split('\n');

        for (var line in lines) {
          if (line.startsWith('event: ')) {
            eventBuffer = line.substring(7);
            dataBuffer = '';
            isCollectingData = true;
            continue;
          }

          if (line.startsWith('data: ')) {
            if (line.substring(6) == '[DONE]') {
              isCollectingData = false;
              continue;
            }
            dataBuffer += line.substring(6);
            continue;
          }

          // Empty line signals end of event
          if (line.trim().isEmpty && isCollectingData && dataBuffer.isNotEmpty) {
            try {
              final jsonData = jsonDecode(dataBuffer);
              log('Parsed event: $eventBuffer');
              log('Parsed data: $jsonData');

              if (eventBuffer == 'values' && jsonData['messages'] != null) {
                final messages = jsonData['messages'] as List;
                for (var message in messages) {
                  if (message['type'] == 'ai' && message['content'] != null) {
                    log('Found AI response: ${message['content']}');
                    yield {'type': 'assistant', 'content': message['content'].toString()};
                  }
                }
              }
            } catch (e) {
              log('Error parsing complete event data: $e');
            }
            dataBuffer = '';
            isCollectingData = false;
          }
        }
      }
    } finally {
      client.close();
    }
  }
}
