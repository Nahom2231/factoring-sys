package com.fiep.factoring_sys.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

    private final Path uploadRoot;

    public DocumentStorageService(
            @Value("${fiep.uploads.directory:uploads}") String uploadDirectory) {
        this.uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Choose a non-empty PDF, JPEG, or PNG file.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Uploaded files must be 10 MB or smaller.");
        }

        try {
            byte[] content = file.getBytes();
            if (content.length > MAX_FILE_SIZE_BYTES) {
                throw new ResponseStatusException(
                        HttpStatus.PAYLOAD_TOO_LARGE,
                        "Uploaded files must be 10 MB or smaller.");
            }

            String extension = detectExtension(content);
            if (extension == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only PDF, JPEG, and PNG files are supported.");
            }

            Files.createDirectories(uploadRoot);
            String fileName = UUID.randomUUID() + extension;
            Path target = uploadRoot.resolve(fileName).normalize();
            if (!target.startsWith(uploadRoot)) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Unable to store the uploaded document.");
            }

            Files.write(
                    target,
                    content,
                    StandardOpenOption.CREATE_NEW,
                    StandardOpenOption.WRITE);
            return "uploads/" + fileName;
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store the uploaded document.",
                    exception);
        }
    }

    private String detectExtension(byte[] content) {
        if (content.length >= 5
                && content[0] == '%'
                && content[1] == 'P'
                && content[2] == 'D'
                && content[3] == 'F'
                && content[4] == '-') {
            return ".pdf";
        }
        if (content.length >= 8
                && (content[0] & 0xff) == 0x89
                && content[1] == 'P'
                && content[2] == 'N'
                && content[3] == 'G'
                && content[4] == 0x0d
                && content[5] == 0x0a
                && content[6] == 0x1a
                && content[7] == 0x0a) {
            return ".png";
        }
        if (content.length >= 3
                && (content[0] & 0xff) == 0xff
                && (content[1] & 0xff) == 0xd8
                && (content[2] & 0xff) == 0xff) {
            return ".jpg";
        }
        return null;
    }
}
