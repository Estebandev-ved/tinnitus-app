package com.tinnitus.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Llamada a la Messages API de Anthropic. La clave sale de ANTHROPIC_API_KEY (solo servidor) y nunca se loguea. */
@Component
public class AnthropicChatClient implements AiChatClient {

    static final String ANTHROPIC_VERSION = "2023-06-01";

    private final String apiKey;
    private final String model;
    private final int maxTokens;
    private final String baseUrl;
    private final RestClient http;

    @Autowired
    public AnthropicChatClient(@Value("${anthropic.api-key:}") String apiKey,
                               @Value("${anthropic.model:claude-haiku-4-5}") String model,
                               @Value("${anthropic.max-tokens:500}") int maxTokens,
                               @Value("${anthropic.base-url:https://api.anthropic.com}") String baseUrl) {
        this(apiKey, model, maxTokens, baseUrl, defaultBuilder());
    }

    AnthropicChatClient(String apiKey, String model, int maxTokens, String baseUrl, RestClient.Builder builder) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
        this.maxTokens = maxTokens > 0 ? maxTokens : 500;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.http = builder.build();
    }

    private static RestClient.Builder defaultBuilder() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(45_000);
        return RestClient.builder().requestFactory(factory);
    }

    @Override
    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    @Override
    public Completion complete(String systemPrompt, List<Map<String, String>> turns) {
        Map<String, Object> body = buildBody(model, maxTokens, systemPrompt, turns);
        try {
            JsonNode response = http.post().uri(baseUrl + "/v1/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            return parse(response);
        } catch (RestClientResponseException e) {
            throw new AiUpstreamException(kindFor(e.getStatusCode().value()));
        } catch (ResourceAccessException e) {
            throw new AiUpstreamException(AiUpstreamException.Kind.TIMEOUT);
        }
    }

    static AiUpstreamException.Kind kindFor(int status) {
        if (status == 401 || status == 403) return AiUpstreamException.Kind.AUTH;
        if (status == 429) return AiUpstreamException.Kind.RATE_LIMIT;
        if (status == 408 || status == 504) return AiUpstreamException.Kind.TIMEOUT;
        if (status >= 500) return AiUpstreamException.Kind.SERVER;
        if (status >= 400) return AiUpstreamException.Kind.BAD_REQUEST;
        return AiUpstreamException.Kind.OTHER;
    }

    static Map<String, Object> buildBody(String model, int maxTokens, String systemPrompt,
                                         List<Map<String, String>> turns) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("system", systemPrompt);
        body.put("messages", normalizeTurns(turns));
        // Sonnet 5.5 piensa por defecto y ese razonamiento consume max_tokens: en un chat corto se apaga.
        if (model != null && model.startsWith("claude-sonnet-5-5")) {
            body.put("thinking", Map.of("type", "between_tools"));
        }
        return body;
    }

    /**
     * Reglas de Anthropic: el primer mensaje es user y los roles alternan. Se descartan los assistant iniciales
     * y se fusionan (con linea en blanco) los consecutivos del mismo rol, sin perder el ultimo mensaje del usuario.
     */
    static List<Map<String, String>> normalizeTurns(List<Map<String, String>> turns) {
        List<Map<String, String>> out = new ArrayList<>();
        for (Map<String, String> t : turns) {
            String role = t.get("role");
            String content = t.get("content");
            if (content == null || content.isBlank()) continue;
            if (out.isEmpty()) {
                if (!"user".equals(role)) continue;
                out.add(new LinkedHashMap<>(Map.of("role", "user", "content", content)));
            } else {
                Map<String, String> last = out.get(out.size() - 1);
                if (last.get("role").equals(role)) {
                    last.put("content", last.get("content") + "\n\n" + content);
                } else {
                    out.add(new LinkedHashMap<>(Map.of("role", role, "content", content)));
                }
            }
        }
        return out;
    }

    static Completion parse(JsonNode body) {
        if (body == null) return new Completion("", 0);
        StringBuilder text = new StringBuilder();
        for (JsonNode block : body.path("content")) {
            if ("text".equals(block.path("type").asText())) {
                text.append(block.path("text").asText(""));
            }
        }
        JsonNode u = body.path("usage");
        long tokens = u.path("input_tokens").asLong(0) + u.path("output_tokens").asLong(0)
                + u.path("cache_creation_input_tokens").asLong(0) + u.path("cache_read_input_tokens").asLong(0);
        return new Completion(text.toString().trim(), tokens);
    }
}
