package matcha.banking.be.dto;

import lombok.Data;

@Data
public class OrderDetailRequest {
    private Long productId;
    private Integer amount;
}
