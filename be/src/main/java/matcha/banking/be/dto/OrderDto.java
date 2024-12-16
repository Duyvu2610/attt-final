package matcha.banking.be.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;

    private GetUserInfoDto user;

    private List<OrderDetailDto> orderDetails;

    private String digitalSignature;
    private boolean verified;
    private Integer totalPrice;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
