package matcha.banking.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import matcha.banking.be.entity.ProductEntity;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class OrderDetailJSON {
    private Integer productId;
    private Integer amount;
    private Integer price;
}
