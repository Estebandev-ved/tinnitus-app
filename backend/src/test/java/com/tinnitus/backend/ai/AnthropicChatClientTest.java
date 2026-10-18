package com.tinnitus.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class AnthropicChatClientTest {

    private static final ObjectMapper JSON = new ObjectMapper();

    private static Map<String, String> t(String role, String content) {
        return Map.of("role", role, "content", content);
    }

    @Test
    void bodyHasSystemAsSeparateFieldAndMaxTokens() {
        Map<String, Object> body = AnthropicChatClient.buildBody("claude-haiku-4-5", 500, "SYS",
                List.of(t("user", "hola")));
        assertEquals("claude-haiku-4-5", body.get("model"));
        assertEquals(500, body.get("max_tokens"));
        assertEquals("SYS", body.get("system"));
        assertEquals(List.of(t("user", "hola")), body.get("messages"));
        assertNull(body.get("thinking"));
    }

    @Test
    void sonnet55DisablesThinkingBetweenTools() {
        Map<String, Object> body = AnthropicChatClient.buildBody("claude-sonnet-5-5", 500, "S",
                List.of(t("user", "x")));
        assertEquals(Map.of("type", "between_tools"), body.get("thinking"));
    }

    @Test
    void dropsLeadingAssistantTurns() {
        List<Map<String, String>> out = AnthropicChatClient.normalizeTurns(List.of(
                t("assistant", "Bienvenido"), t("user", "hola")));
        assertEquals(List.of(t("user", "hola")), out);
    }

    @Test
    void mergesConsecutiveSameRoleKeepingLastUserMessage() {
        List<Map<String, String>> out = AnthropicChatClient.normalizeTurns(List.of(
                t("user", "a"), t("user", "b"), t("assistant", "r1"), t("assistant", "r2"), t("user", "ultimo")));
        assertEquals(3, out.size());
        assertEquals(t("user", "a\n\nb"), out.get(0));
        assertEquals(t("assistant", "r1\n\nr2"), out.get(1));
        assertEquals(t("user", "ultimo"), out.get(2));
    }

    @Test
    void resultAlternatesAndEndsWithUser() {
        List<Map<String, String>> out = AnthropicChatClient.normalizeTurns(List.of(
                t("assistant", "x"), t("assistant", "y"), t("user", "u1"), t("assistant", "a1"),
                t("user", "u2"), t("user", "u3")));
        assertEquals("user", out.get(0).get("role"));
        for (int i = 1; i < out.size(); i++) {
            assertFalse(out.get(i).get("role").equals(out.get(i - 1).get("role")));
        }
        assertEquals("user", out.get(out.size() - 1).get("role"));
        assertTrue(out.get(out.size() - 1).get("content").endsWith("u3"));
    }

    @Test
    void parsesTextBlocksAndRealUsage() throws Exception {
        JsonNode json = JSON.readTree("""
                {"content":[{"type":"text","text":"Hola "},{"type":"text","text":"mundo"}],
                 "stop_reason":"end_turn","usage":{"input_tokens":120,"output_tokens":30}}""");
        AiChatClient.Completion c = AnthropicChatClient.parse(json);
        assertEquals("Hola mundo", c.text());
        assertEquals(150, c.totalTokens());
    }

    @Test
    void parseToleratesEmptyBody() {
        assertEquals("", AnthropicChatClient.parse(null).text());
    }

    @Test
    void mapsStatusCodesToKinds() {
        assertEquals(AiUpstreamException.Kind.AUTH, AnthropicChatClient.kindFor(401));
        assertEquals(AiUpstreamException.Kind.RATE_LIMIT, AnthropicChatClient.kindFor(429));
        assertEquals(AiUpstreamException.Kind.SERVER, AnthropicChatClient.kindFor(529));
        assertEquals(AiUpstreamException.Kind.SERVER, AnthropicChatClient.kindFor(500));
        assertEquals(AiUpstreamException.Kind.BAD_REQUEST, AnthropicChatClient.kindFor(400));
        assertTrue(new AiUpstreamException(AiUpstreamException.Kind.AUTH).isServiceUnavailable());
        assertFalse(new AiUpstreamException(AiUpstreamException.Kind.SERVER).isServiceUnavailable());
    }

    @Test
    void sendsHeadersAndParsesOverHttp() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        AnthropicChatClient client = new AnthropicChatClient("test-key", "claude-haiku-4-5", 500,
                "https://api.test", builder);
        server.expect(requestTo("https://api.test/v1/messages"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("x-api-key", "test-key"))
                .andExpect(header("anthropic-version", "2023-06-01"))
                .andExpect(jsonPath("$.system").value("SYS"))
                .andExpect(jsonPath("$.messages[0].role").value("user"))
                .andRespond(withSuccess("""
                        {"content":[{"type":"text","text":"ok"}],"usage":{"input_tokens":5,"output_tokens":2}}""",
                        MediaType.APPLICATION_JSON));
        AiChatClient.Completion c = client.complete("SYS", List.of(t("user", "hola")));
        assertEquals("ok", c.text());
        assertEquals(7, c.totalTokens());
        server.verify();
    }

    @Test
    void upstreamErrorsBecomeKindsWithoutLeakingBodyOrKey() {
        int[] statuses = {401, 429, 500};
        AiUpstreamException.Kind[] kinds = {AiUpstreamException.Kind.AUTH, AiUpstreamException.Kind.RATE_LIMIT,
                AiUpstreamException.Kind.SERVER};
        for (int i = 0; i < statuses.length; i++) {
            RestClient.Builder builder = RestClient.builder();
            MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
            AnthropicChatClient client = new AnthropicChatClient("secret-key", "m", 500, "https://api.test", builder);
            server.expect(requestTo("https://api.test/v1/messages"))
                    .andRespond(withStatus(HttpStatus.valueOf(statuses[i])).body("detalle interno secret-key"));
            AiUpstreamException e = assertThrows(AiUpstreamException.class,
                    () -> client.complete("S", List.of(t("user", "x"))));
            assertEquals(kinds[i], e.kind());
            assertFalse(String.valueOf(e.getMessage()).contains("secret-key"));
        }
    }

    @Test
    void providerSelection() {
        assertEquals(AiProviderSelector.Provider.ANTHROPIC, AiProviderSelector.resolve("", true, true));
        assertEquals(AiProviderSelector.Provider.AZURE, AiProviderSelector.resolve("", false, true));
        assertEquals(AiProviderSelector.Provider.NONE, AiProviderSelector.resolve(null, false, false));
        assertEquals(AiProviderSelector.Provider.AZURE, AiProviderSelector.resolve("azure", true, true));
        assertEquals(AiProviderSelector.Provider.ANTHROPIC, AiProviderSelector.resolve(" Anthropic ", true, true));
        assertEquals(AiProviderSelector.Provider.NONE, AiProviderSelector.resolve("azure", true, false));
    }
}
