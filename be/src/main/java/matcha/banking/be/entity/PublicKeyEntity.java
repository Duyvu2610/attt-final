package matcha.banking.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "keys")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicKeyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 2048)
    private String publicKey;

    @Column(nullable = false)
    private Long userId;

    @CreationTimestamp
    private LocalDateTime createTime;

    private LocalDateTime endTime;
}
