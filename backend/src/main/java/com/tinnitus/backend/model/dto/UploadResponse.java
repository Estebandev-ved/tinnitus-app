package com.tinnitus.backend.model.dto;

/**
 * DTO de respuesta para la subida de un APK.
 * Contiene el ID, versión y URL de descarga del release creado.
 */
public class UploadResponse {

    private Long id;
    private String version;
    private String downloadUrl;

    public UploadResponse(Long id, String version, String downloadUrl) {
        this.id = id;
        this.version = version;
        this.downloadUrl = downloadUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
