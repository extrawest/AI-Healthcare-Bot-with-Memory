import 'package:flutter/material.dart';

import 'common/global_bloc_provider.dart';
import 'features/chat/screens/chat_screen.dart';

class Application extends StatelessWidget {
  const Application({super.key});

  @override
  Widget build(BuildContext context) {
    return GlobalBlocProvider(
      child: MaterialApp(
        title: 'Healthcare Assistant',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: const ChatScreen(),
      ),
    );
  }
}
