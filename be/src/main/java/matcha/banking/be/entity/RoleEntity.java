package matcha.banking.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import matcha.banking.be.enum_type.Role;

@Entity
@Table(name = "roles")
@Data
public class RoleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Role role;
}
