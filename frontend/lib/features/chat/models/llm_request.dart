class LLMRequest {
  final String userMessage;
  final String userId;

  const LLMRequest({
    required this.userMessage,
    required this.userId,
  });

  Map<String, dynamic> toJson() => {
        'userMessage': userMessage,
        'userId': userId,
      };
}
