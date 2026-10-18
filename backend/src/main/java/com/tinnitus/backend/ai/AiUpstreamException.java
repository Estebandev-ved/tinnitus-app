package com.tinnitus.backend.ai;

/** Fallo del proveedor de IA. Nunca incluye el cuerpo de la respuesta ni la clave. */
public class AiUpstreamException extends RuntimeException {

    public enum Kind { AUTH, RATE_LIMIT, SERVER, TIMEOUT, BAD_REQUEST, OTHER }

    private final Kind kind;

    public AiUpstreamException(Kind kind) {
        super(kind.name());
        this.kind = kind;
    }

    public Kind kind() {
        return kind;
    }

    /** Fallo de credenciales o de cuota del proveedor: para el cliente es "servicio no disponible". */
    public boolean isServiceUnavailable() {
        return kind == Kind.AUTH || kind == Kind.RATE_LIMIT;
    }
}
