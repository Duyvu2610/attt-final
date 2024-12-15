package matcha.banking.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class OrderRequest {
    private Long userId;
    private List<OrderDetailRequest> orderDetails;
}
