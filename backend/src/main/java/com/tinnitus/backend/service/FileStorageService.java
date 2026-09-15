package com.tinnitus.backend.service;

import com.tinnitus.backend.model.entity.AppRelease;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Servicio de almacenamiento de archivos APK en el sistema de archivos local.
 *
 * Seguridad: Los nombres de archivo se generan con UUID para evitar
 * path traversal y colisiones. No se exponen rutas absolutas al cliente.
 */
@Service
public class FileStorageService {

    private final Path fileStorageLocation = Paths.get("uploads/apks");

    public FileStorageService() {
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception e) {
            throw new RuntimeException("Could not create storage directory", e);
        }
    }

    /**
     * Almacena un APK recibido via multipart.
     * Retorna el nombre único del archivo generado.
     */
    public String storeAPK(MultipartFile file, String version) throws IOException {
        String uniqueFileName = version + "-" + UUID.randomUUID() + ".apk";
        Path targetLocation = fileStorageLocation.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation);
        return uniqueFileName;
    }

    /**
     * Almacena un APK como array de bytes (usado en upload via JSON).
     * Retorna el nombre único del archivo generado.
     */
    public String storeAPKBytes(byte[] data, String version) throws IOException {
        String uniqueFileName = version + "-" + UUID.randomUUID() + ".apk";
        Path targetLocation = fileStorageLocation.resolve(uniqueFileName);
        Files.write(targetLocation, data);
        return uniqueFileName;
    }

    /**
     * Obtiene el recurso Spring para streaming de APK (respuesta HTTP).
     */
    public org.springframework.core.io.Resource getApkResource(String filename) {
        Path filePath = fileStorageLocation.resolve(filename).toAbsolutePath().normalize();
        return new org.springframework.core.io.FileSystemResource(filePath.toFile());
    }

    /**
     * Obtiene el contenido del APK como array de bytes.
     * Usado cuando se necesita el contenido completo en memoria.
     */
    public byte[] getApkFile(AppRelease appRelease) {
        if (appRelease.getApkFilename() == null) {
            return new byte[0];
        }
        Path filePath = fileStorageLocation.resolve(appRelease.getApkFilename()).toAbsolutePath().normalize();
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read APK file: " + appRelease.getApkFilename(), e);
        }
    }

    /**
     * Elimina un APK del almacenamiento local.
     */
    public void deleteAPK(String filename) {
        Path filePath = fileStorageLocation.resolve(filename);
        try {
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            // Log implícito — no se propaga para no interrumpir el flujo
        }
    }
}