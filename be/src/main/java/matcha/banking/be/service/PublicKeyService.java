package matcha.banking.be.service;


import lombok.RequiredArgsConstructor;
import matcha.banking.be.dao.PublicKeyDao;
import matcha.banking.be.entity.PublicKeyEntity;
import matcha.banking.be.util.KeyUtils;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PublicKeyService {

    private final PublicKeyDao repository;

    // Lưu Public Key mới và vô hiệu hóa Key cũ
    public void savePublicKey(Long userId, String publicKey) {
        // Kiểm tra xem có Public Key nào đang active không
        Optional<PublicKeyEntity> activeKey = repository.findByUserIdAndEndTimeIsNull(userId);

        if (activeKey.isPresent()) {
            // Vô hiệu hóa Key cũ
            PublicKeyEntity oldKey = activeKey.get();
            oldKey.setEndTime(LocalDateTime.now());
            repository.save(oldKey);
        }

        // Thêm Public Key mới và kích hoạt
        PublicKeyEntity newKey = new PublicKeyEntity();
        newKey.setUserId(userId);
        newKey.setPublicKey(publicKey);
        newKey.setCreateTime(LocalDateTime.now());
        newKey.setEndTime(null); // Active Key mới

        repository.save(newKey);
    }

    // Lấy Public Key đang hoạt động (active)
    public Optional<PublicKeyEntity> getActivePublicKey(Long userId) {
        return repository.findByUserIdAndEndTimeIsNull(userId);
    }

    // Báo mất Key hiện tại và phát sinh Key mới
    public String reportLostKey(Long userId) throws NoSuchAlgorithmException {
        // Kiểm tra Public Key đang active
        Optional<PublicKeyEntity> activeKey = repository.findByUserIdAndEndTimeIsNull(userId);

        if (activeKey.isPresent()) {
            // Vô hiệu hóa Public Key cũ
            PublicKeyEntity lostKey = activeKey.get();
            lostKey.setEndTime(LocalDateTime.now());
            repository.save(lostKey);
        }

        // Tạo mới và kích hoạt Key
        PublicKeyEntity newKey = new PublicKeyEntity();
        KeyPair keyPair = KeyUtils.generateKeyPair();
        String publicKey = KeyUtils.encodeKey(keyPair.getPublic().getEncoded());
        newKey.setUserId(userId);
        newKey.setPublicKey(publicKey);
        newKey.setCreateTime(LocalDateTime.now());
        newKey.setEndTime(null); // Active Key mới
        repository.save(newKey);
        return KeyUtils.encodeKey(keyPair.getPrivate().getEncoded());
    }

    // Lấy tất cả các Public Keys của một user
    public List<PublicKeyEntity> getAllKeys(Long userId) {
        return repository.findByUserId(userId);
    }
}
