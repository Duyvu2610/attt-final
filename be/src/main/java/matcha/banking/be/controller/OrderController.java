package matcha.banking.be.controller;

import lombok.RequiredArgsConstructor;
import matcha.banking.be.dao.ProductDao;
import matcha.banking.be.dao.UserDao;
import matcha.banking.be.dto.OrderDetailRequest;
import matcha.banking.be.dto.OrderRequest;
import matcha.banking.be.entity.OrderDetailEntity;
import matcha.banking.be.entity.OrderEntity;
import matcha.banking.be.entity.ProductEntity;
import matcha.banking.be.entity.UserEntity;
import matcha.banking.be.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserDao userRepository;
    private final ProductDao productRepository;

    @PostMapping("/create")
    public ResponseEntity<OrderEntity> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            // 1. Lấy thông tin người dùng
            UserEntity user = userRepository.findById(Math.toIntExact(orderRequest.getUserId()))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 2. Lấy thông tin sản phẩm từ request
            List<OrderDetailEntity> orderDetails = new ArrayList<>();
            for (OrderDetailRequest detailRequest : orderRequest.getOrderDetails()) {
                ProductEntity product = productRepository.findById(Math.toIntExact(detailRequest.getProductId()))
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                OrderDetailEntity orderDetail = new OrderDetailEntity();
                orderDetail.setProduct(product);
                orderDetail.setAmount(detailRequest.getAmount());
                orderDetail.setPrice(product.getPrice());
                orderDetails.add(orderDetail);
            }

            // 3. Tạo đơn hàng mới
            OrderEntity order = new OrderEntity();
            order.setUser(user);
            order.setOrderDetails(orderDetails);
            order.setVerified(false); // Ban đầu chưa xác thực chữ ký

            // 4. Lưu đơn hàng vào DB
            order = orderService.saveOrder(order);

            // 6. Trả về phản hồi
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null); // Lỗi server khi tạo đơn hàng
        }
    }

    // Lấy dữ liệu cần ký
    @GetMapping("/{orderId}/signature-data")
    public ResponseEntity<String> getSignatureData(@PathVariable Long orderId) {
        String data = orderService.generateSignatureData(orderId);
        return ResponseEntity.ok(data);
    }

    // Lưu chữ ký số
    @PostMapping("/{orderId}/digital-signature")
    public ResponseEntity<Void> saveDigitalSignature(
            @PathVariable Long orderId,
            @RequestBody String digitalSignature
    ) {
        orderService.saveDigitalSignature(orderId, digitalSignature);
        return ResponseEntity.ok().build();
    }

    // Xác minh chữ ký số
    @GetMapping("/{orderId}/verify")
    public ResponseEntity<Boolean> verifyOrder(@PathVariable Long orderId) {
        boolean isVerified = orderService.verifyOrder(orderId);
        return ResponseEntity.ok(isVerified);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderEntity>> getOrdersByUser(@PathVariable Long userId) {
        List<OrderEntity> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
}


