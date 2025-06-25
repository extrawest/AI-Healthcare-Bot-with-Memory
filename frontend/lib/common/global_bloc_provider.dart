import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../features/chat/cubit/chat_cubit.dart';
import '../features/chat/repository/chat_repository.dart';

class GlobalBlocProvider extends StatelessWidget {
  final Widget child;

  const GlobalBlocProvider({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => ChatCubit(
            repository: context.read<ChatRepository>(),
          ),
        ),
      ],
      child: child,
    );
  }
}
