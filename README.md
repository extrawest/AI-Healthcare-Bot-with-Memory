# AI Healthcare Bot with Memory

A sophisticated healthcare chatbot that leverages advanced AI capabilities with memory retention to provide personalized medical information and assistance. This project combines modern technologies for both backend and frontend to deliver a seamless user experience.

## Demo

https://github.com/user-attachments/assets/6151506b-f2cd-4633-8950-7365adc7bd76

## 🚀 Features

-   Real-time chat interface with AI healthcare assistant
-   Long-term memory retention for personalized interactions
-   Cross-platform support (iOS, Android)

## 🛠 Technology Stack

### Backend

-   **LangGraph Server**: Orchestrates the AI conversation flow and decision-making
-   **Ollama**: Local LLM deployment for AI processing
-   **Qdrant**: Vector database for efficient similarity search
-   **Mem0**: Memory system for conversation context retention
-   **TypeScript**: Backend implementation language
-   **Node.js**: Runtime environment

### Frontend

-   **Flutter**: Cross-platform UI framework
-   **Dart**: Programming language for Flutter
-   **BLoC Pattern**: State management
-   **Material Design**: UI components and styling

## 📋 Prerequisites

-   Node.js (v18 or higher)
-   Flutter SDK (latest stable version)
-   Docker (for running Qdrant and Ollama)
-   Git

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. Start server:

    ```bash
    npx @langchain/langgraph-cli dev
    ```

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Get Flutter dependencies:

    ```bash
    flutter pub get
    ```

3. Run the application:
    ```bash
    flutter run
    ```

## 🏗 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── agent.ts          # AI agent configuration
│   │   ├── services/         # Core services (LLM, Memory, etc.)
│   │   └── types/           # TypeScript type definitions
│   └── langgraph.json       # LangGraph configuration
└── frontend/
    └── lib/
        ├── features/        # Feature-based architecture
        │   └── chat/        # Chat feature implementation
        └── common/          # Shared utilities and widgets
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the BSD-3-Clause license License - see the [LICENSE](https://github.com/extrawest/AI-Healthcare-Bot-with-Memory/blob/main/LICENSE.txt) file for details.

## 👥 Authors

-   Alex Samoilenko

## License

This project is licensed under the MIT License - see the LICENSE.txt file for details.

---

Created by Oleksandr Samoilenko  
[Extrawest.com](https://extrawest.com), 2025
