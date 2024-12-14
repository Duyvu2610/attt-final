package matcha.banking.be.dao;

import matcha.banking.be.entity.PublicKeyEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicKeyDao extends CrudRepository<PublicKeyEntity, Long> {
    Optional<PublicKeyEntity> findByUserIdAndEndTimeIsNull(Long userId);
    // Lấy tất cả Public Keys của người dùng
    List<PublicKeyEntity> findByUserId(Long userId);
}
