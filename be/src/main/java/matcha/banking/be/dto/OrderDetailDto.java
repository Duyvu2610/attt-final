package matcha.banking.be.dto;

import lombok.Data;
import matcha.banking.be.entity.ProductEntity;

@Data
public class OrderDetailDto {
    private Integer id;
    private ProductEntity product;
    private Integer amount;
    private Integer price;
}
