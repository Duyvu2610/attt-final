package matcha.banking.be.controller;


import lombok.RequiredArgsConstructor;
import matcha.banking.be.entity.PublicKeyEntity;
import matcha.banking.be.service.PublicKeyService;
import matcha.banking.be.util.KeyUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/keys")
@RequiredArgsConstructor
public class PublicKeyController {

    private final PublicKeyService service;

    // Phát sinh cặp Key
    @GetMapping("/generate/{userId}")
    public ResponseEntity<Map<String, String>> generateKeyPair(@PathVariable Long userId) {
        try {
            // Phát sinh cặp key
            KeyPair keyPair = KeyUtils.generateKeyPair();
            String privateKey = KeyUtils.encodeKey(keyPair.getPrivate().getEncoded());
            String publicKey = KeyUtils.encodeKey(keyPair.getPublic().getEncoded());

            // Lưu Public Key vào database
            service.savePublicKey(userId, publicKey);

            // Trả Private Key cho user (chỉ người dùng giữ)
            return ResponseEntity.ok(Map.of(
                    "privateKey", privateKey, // Người dùng tải về Private Key
                    "publicKey", publicKey   // Public Key hiển thị hoặc ghi nhận trong DB
            ));
        } catch (NoSuchAlgorithmException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Key generation failed."));
        }
    }


    // Lưu Public Key
    @PostMapping("/save")
    public ResponseEntity<String> savePublicKey(@RequestParam Long userId, @RequestParam String publicKey) {
        service.savePublicKey(userId, publicKey);
        return ResponseEntity.ok("Public Key saved successfully.");
    }

    // Báo mất Key và phát sinh Key mới
    @PostMapping("/report-lost")
    public ResponseEntity<Object> reportLostKey(@RequestParam Long userId, @RequestBody Map<String, String> body) throws NoSuchAlgorithmException {
        String timeString = body.get("time");
        LocalDateTime time = LocalDateTime.parse(timeString);
        return ResponseEntity.ok(service.reportLostKey(userId, time));
    }

    // Lấy Public Key đang hoạt động
    @GetMapping("/active/{userId}")
    public ResponseEntity<Optional<PublicKeyEntity>> getActivePublicKey(@PathVariable Long userId) {
        Optional<PublicKeyEntity> activeKey = service.getActivePublicKey(userId);

        if (activeKey.isPresent()) {
            return ResponseEntity.ok(activeKey);
        } else {
            return ResponseEntity.status(404).body(Optional.empty());
        }
    }

    // Lấy tất cả Keys của một người dùng
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<PublicKeyEntity>> getAllKeys(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getAllKeys(userId));
    }
}
