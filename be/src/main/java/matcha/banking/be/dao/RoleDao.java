package matcha.banking.be.dao;

import matcha.banking.be.entity.RoleEntity;
import matcha.banking.be.enum_type.Role;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RoleDao extends CrudRepository<RoleEntity, Long> {
    Optional<RoleEntity> findByRole(Role role);
}
