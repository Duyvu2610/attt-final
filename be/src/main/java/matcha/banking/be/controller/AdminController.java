package matcha.banking.be.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import matcha.banking.be.entity.OrderEntity;
import matcha.banking.be.mapper.OrderMapper;
import matcha.banking.be.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @GetMapping("/test")
    public void test(){
        log.info("testing authorization");
    }

    @GetMapping("/orders")
    public ResponseEntity<Object> getOrders(){
        List<OrderEntity> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders.stream().map(orderMapper::dtoToEntity).toList());
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Object> deleteOrder(@PathVariable Long id){
        orderService.deleteOrder(id);
        return ResponseEntity.ok().build();
    }

}
