package com.tinnitus.backend.controller;

import com.tinnitus.backend.service.DataExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/export")
@PreAuthorize("hasRole('ADMIN')")
public class ExportController {

    private final DataExportService dataExportService;

    public ExportController(DataExportService dataExportService) {
        this.dataExportService = dataExportService;
    }

    @GetMapping("/research/thi")
    public ResponseEntity<?> exportThi(@RequestParam(defaultValue = "csv") String format) {
        List<Map<String, Object>> rows = dataExportService.thiRows();
        if ("json".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(rows);
        }
        return csvResponse(dataExportService.toCsv(rows), "thi_research.csv");
    }

    @GetMapping("/research/audiometry")
    public ResponseEntity<?> exportAudiometry(@RequestParam(defaultValue = "csv") String format) {
        List<Map<String, Object>> rows = dataExportService.audiometryRows();
        if ("json".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(rows);
        }
        return csvResponse(dataExportService.toCsv(rows), "audiometry_research.csv");
    }

    private ResponseEntity<?> csvResponse(String csv, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
        headers.setContentDispositionFormData("attachment", filename);
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }
}
