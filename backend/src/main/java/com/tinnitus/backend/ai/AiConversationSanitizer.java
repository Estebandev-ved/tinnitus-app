package com.tinnitus.backend.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Convierte el historial enviado por el cliente en turnos para el modelo.
 * Solo se producen los roles "user" y "assistant"; el rol "system" lo fija unicamente el servidor.
 * Cualquier otro emisor se rechaza (el controlador responde 400).
 */
public final class AiConversationSanitizer {

    public static final int MAX_HISTORY = 20;
    public static final int MAX_TEXT = 2000;

    /** Emisor invalido, longitud excedida o demasiados mensajes. */
    public static class InvalidHistoryException extends RuntimeException {
        public InvalidHistoryException(String message) {
            super(message);
        }
    }

    private AiConversationSanitizer() {
    }

    /** "user" -> user; "bot"/"assistant" (lo que envia el cliente) -> assistant; otro -> null. */
    static String roleFor(String sender) {
        if (sender == null) return null;
        return switch (sender.trim().toLowerCase(Locale.ROOT)) {
            case "user" -> "user";
            case "bot", "assistant" -> "assistant";
            default -> null;
        };
    }

    /** Quita caracteres de control (conserva salto de linea y tabulacion) y recorta. */
    static String cleanText(String s) {
        if (s == null) return "";
        return s.replaceAll("[\\p{Cntrl}&&[^\\n\\t]]", "").trim();
    }

    public static List<Map<String, String>> toTurns(List<AiChatRequest.HistoryItem> history, String message) {
        List<Map<String, String>> turns = new ArrayList<>();
        if (history != null) {
            if (history.size() > MAX_HISTORY) {
                throw new InvalidHistoryException("Historial demasiado largo.");
            }
            for (AiChatRequest.HistoryItem h : history) {
                if (h == null) continue;
                String role = roleFor(h.sender());
                if (role == null) {
                    throw new InvalidHistoryException("Emisor de historial no permitido.");
                }
                String text = cleanText(h.text());
                if (text.isEmpty()) continue;
                if (text.length() > MAX_TEXT) {
                    throw new InvalidHistoryException("Mensaje de historial demasiado largo.");
                }
                turns.add(Map.of("role", role, "content", text));
            }
        }
        turns.add(Map.of("role", "user", "content", cleanText(message)));
        return turns;
    }
}
