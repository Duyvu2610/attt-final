package matcha.banking.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import matcha.banking.be.entity.OrderDetailEntity;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class SignatureData {
    private Long orderId;
    private Integer userId;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private List<OrderDetailJSON> orderDetails;
}

