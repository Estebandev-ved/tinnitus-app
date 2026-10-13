package com.tinnitus.backend.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Cuerpo de POST /api/v1/ai/chat. El cliente NUNCA envía el system prompt ni la
 * configuración del modelo: eso vive en el servidor (evita usar la clave como GPT gratis).
 */
public record AiChatRequest(
        @NotBlank @Size(max = 2000) String message,
        @Size(max = 20) List<@Valid HistoryItem> history,
        @Valid Context context) {

    public record HistoryItem(@Size(max = 10) String sender, @Size(max = 2000) String text) {
    }

    /** Solo datos agregados: sin nombre, email, médico, medicamentos ni notas libres. */
    public record Context(
            Double avgStress,
            Double avgTinnitus,
            Double avgSleep,
            Integer streakCount,
            Integer totalLogs,
            Double tinnitusFrequency,
            @Size(max = 40) String years,
            @Size(max = 40) String ear) {
    }
}
