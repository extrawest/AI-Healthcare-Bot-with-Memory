import 'package:get_it/get_it.dart';

import '../features/chat/services/chat_service.dart';

final GetIt locator = GetIt.asNewInstance();

Future<void> injectDependencies() async {
  GetIt.I.registerLazySingleton<ChatApiService>(() => ChatApiService());
}
