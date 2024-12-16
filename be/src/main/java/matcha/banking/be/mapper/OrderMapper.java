package matcha.banking.be.mapper;

import matcha.banking.be.dto.GetUserInfoDto;
import matcha.banking.be.dto.OrderDetailDto;
import matcha.banking.be.dto.OrderDto;
import matcha.banking.be.entity.OrderDetailEntity;
import matcha.banking.be.entity.OrderEntity;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    default OrderDto dtoToEntity(OrderEntity orderEntity) {
        UserMapper userMapper = new UserMapperImpl();
        GetUserInfoDto userInfoDto = userMapper.entityToDto(orderEntity.getUser());
        OrderDto orderDto = new OrderDto();
        orderDto.setId(orderEntity.getId());
        orderDto.setDigitalSignature(orderEntity.getDigitalSignature());
        orderDto.setVerified(orderEntity.getVerified());
        orderDto.setTotalPrice(orderEntity.getTotalPrice());
        orderDto.setCreatedAt(orderEntity.getCreatedAt());
        orderDto.setUpdatedAt(orderEntity.getUpdatedAt());
        orderDto.setUser(userInfoDto);
        List<OrderDetailDto> orderDetailDtos = new ArrayList<>();
        orderEntity.getOrderDetails().forEach(orderDetailEntity -> {
            OrderDetailDto orderDetailDto = new OrderDetailDto();
            orderDetailDto.setId(orderDetailEntity.getId());
            orderDetailDto.setPrice(orderDetailEntity.getPrice());
            orderDetailDto.setAmount(orderDetailEntity.getAmount());
            orderDetailDto.setProduct(orderDetailEntity.getProduct());
            orderDetailDtos.add(orderDetailDto);
        });
        orderDto.setOrderDetails(orderDetailDtos);
        return orderDto;
    }

    default OrderDetailDto entityToDto(OrderDetailEntity orderDetailEntity) {
        OrderDetailDto orderDetailDto1 = new OrderDetailDto();
        orderDetailDto1.setId(orderDetailEntity.getId());
        orderDetailDto1.setPrice(orderDetailEntity.getPrice());
        orderDetailDto1.setAmount(orderDetailEntity.getAmount());
        orderDetailDto1.setProduct(orderDetailEntity.getProduct());
        return orderDetailDto1;
    }
}
