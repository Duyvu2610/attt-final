package matcha.banking.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import matcha.banking.be.enum_type.Role;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class UserEntity {
    /* Id of user */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;

    /* Username of user */
    @Column(name = "username")
    private String name;

    /* Email of user */
    @Column(name = "email")
    private String email;

    /* Password of user */
    @Column(name = "hashed_password")
    private String password;

    /* Creation time */
    @Column(name = "created_at")
    private LocalDateTime created;

    /* Update time */
    @Column(name = "updated_at")
    private LocalDateTime updated;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<RoleEntity> roles;
}
