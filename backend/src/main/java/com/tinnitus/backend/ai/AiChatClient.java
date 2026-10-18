package com.tinnitus.backend.ai;

import java.util.List;
import java.util.Map;

/** Contrato comun de los proveedores de IA (Anthropic / Azure OpenAI). */
public interface AiChatClient {

    /** Texto de la respuesta y tokens reales consumidos (0 si el proveedor no los informa). */
    record Completion(String text, long totalTokens) {
    }

    boolean isConfigured();

    Completion complete(String systemPrompt, List<Map<String, String>> turns);
}
