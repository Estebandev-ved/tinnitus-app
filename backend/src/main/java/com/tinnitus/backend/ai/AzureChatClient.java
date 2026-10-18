package com.tinnitus.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Llamada a Azure OpenAI. La clave sale de variables de entorno del servidor. */
@Component
public class AzureChatClient implements AiChatClient {

    private final String apiKey;
    private final String endpoint;
    private final String deployment;
    private final int maxTokens;
    private final RestClient http;

    public AzureChatClient(@Value("${azure.openai.api-key:}") String apiKey,
                           @Value("${azure.openai.endpoint:}") String endpoint,
                           @Value("${azure.openai.deployment:}") String deployment,
                           @Value("${ai.max-completion-tokens:2048}") int maxTokens) {
        this.apiKey = apiKey;
        this.endpoint = endpoint == null ? "" : endpoint.replaceAll("/+$", "");
        this.deployment = deployment;
        this.maxTokens = maxTokens;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(45_000);
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    @Override
    public boolean isConfigured() {
        return !apiKey.isBlank() && !endpoint.isBlank() && !deployment.isBlank();
    }

    @Override
    public Completion complete(String systemPrompt, List<Map<String, String>> turns) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.addAll(turns);
        String url = endpoint + "/openai/deployments/" + deployment
                + "/chat/completions?api-version=2024-04-01-preview";
        JsonNode body = http.post().uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", apiKey)
                .body(Map.of("messages", messages, "max_completion_tokens", maxTokens))
                .retrieve()
                .body(JsonNode.class);
        String text = body == null ? "" : body.path("choices").path(0).path("message").path("content").asText("");
        long tokens = body == null ? 0 : body.path("usage").path("total_tokens").asLong(0);
        return new Completion(text, tokens);
    }
}
