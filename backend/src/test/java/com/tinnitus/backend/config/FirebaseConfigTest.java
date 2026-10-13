package com.tinnitus.backend.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Tests puros (sin Spring) de la resolucion de credenciales; usa JSON falso. */
class FirebaseConfigTest {

    private static final String FAKE = "{\"type\":\"service_account\",\"project_id\":\"demo\"}";

    @Test
    void rawJsonIsUsed() throws IOException {
        assertArrayEquals(FAKE.getBytes(StandardCharsets.UTF_8),
                FirebaseConfig.resolveCredentialBytes("  " + FAKE + "\n", "", null));
    }

    @Test
    void base64JsonIsDecoded() throws IOException {
        String b64 = Base64.getEncoder().encodeToString(FAKE.getBytes(StandardCharsets.UTF_8));
        assertArrayEquals(FAKE.getBytes(StandardCharsets.UTF_8),
                FirebaseConfig.resolveCredentialBytes(b64, null, null));
    }

    @Test
    void garbageJsonFailsWithoutEchoingValue() {
        IOException e = assertThrows(IOException.class,
                () -> FirebaseConfig.resolveCredentialBytes("not-json-secret", null, null));
        org.junit.jupiter.api.Assertions.assertFalse(e.getMessage().contains("not-json-secret"));
    }

    @Test
    void fileFallbackAndNone() throws IOException {
        Path f = Files.createTempFile("sa", ".json");
        try {
            Files.writeString(f, FAKE);
            assertArrayEquals(FAKE.getBytes(StandardCharsets.UTF_8),
                    FirebaseConfig.resolveCredentialBytes("", f.toString(), null));
            assertArrayEquals(FAKE.getBytes(StandardCharsets.UTF_8),
                    FirebaseConfig.resolveCredentialBytes(null, null, f.toString()));
        } finally {
            Files.deleteIfExists(f);
        }
        assertNull(FirebaseConfig.resolveCredentialBytes("", "", ""));
    }
}
