package matcha.banking.be.dto;

import lombok.Data;
import matcha.banking.be.entity.OrderDetailEntity;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SignatureData {
    private Long orderId;
    private Integer userId;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private List<OrderDetailEntity> orderDetails;
}

