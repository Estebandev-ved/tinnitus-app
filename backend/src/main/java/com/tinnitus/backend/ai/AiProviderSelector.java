package com.tinnitus.backend.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Elige el proveedor de IA activo. AI_PROVIDER = anthropic | azure; si esta vacio, anthropic cuando hay
 * ANTHROPIC_API_KEY, si no azure cuando esta configurado. Sin ninguno -> active() == null (el endpoint da 503).
 */
@Component
public class AiProviderSelector {

    public enum Provider { ANTHROPIC, AZURE, NONE }

    private final AnthropicChatClient anthropic;
    private final AzureChatClient azure;
    private final String configured;

    public AiProviderSelector(AnthropicChatClient anthropic, AzureChatClient azure,
                              @Value("${ai.provider:}") String configured) {
        this.anthropic = anthropic;
        this.azure = azure;
        this.configured = configured;
    }

    static Provider resolve(String configured, boolean anthropicOk, boolean azureOk) {
        String c = configured == null ? "" : configured.trim().toLowerCase(Locale.ROOT);
        return switch (c) {
            case "anthropic" -> anthropicOk ? Provider.ANTHROPIC : Provider.NONE;
            case "azure" -> azureOk ? Provider.AZURE : Provider.NONE;
            default -> anthropicOk ? Provider.ANTHROPIC : azureOk ? Provider.AZURE : Provider.NONE;
        };
    }

    public Provider provider() {
        return resolve(configured, anthropic.isConfigured(), azure.isConfigured());
    }

    /** Cliente activo o null si ninguno esta configurado. */
    public AiChatClient active() {
        return switch (provider()) {
            case ANTHROPIC -> anthropic;
            case AZURE -> azure;
            case NONE -> null;
        };
    }
}
