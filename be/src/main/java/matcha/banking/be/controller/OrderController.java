package matcha.banking.be.controller;

import lombok.RequiredArgsConstructor;
import matcha.banking.be.dao.CartDao;
import matcha.banking.be.dao.ProductDao;
import matcha.banking.be.dao.UserDao;
import matcha.banking.be.dto.CartRequestPayDto;
import matcha.banking.be.dto.OrderDetailRequest;
import matcha.banking.be.dto.OrderRequest;
import matcha.banking.be.entity.*;
import matcha.banking.be.mapper.OrderMapper;
import matcha.banking.be.service.OrderService;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserDao userRepository;
    private final ProductDao productRepository;
    private final CartDao cartDao;
    private final OrderMapper orderMapper;

    @PostMapping("/create")
    public ResponseEntity<OrderEntity> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            // 1. Lấy thông tin người dùng
            UserEntity user = userRepository.findById(Math.toIntExact(orderRequest.getUserId()))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 3. Tạo đơn hàng mới
            OrderEntity order = new OrderEntity();
            order.setUser(user);

            order.setVerified(false); // Ban đầu chưa xác thực chữ ký

            // 2. Lấy thông tin sản phẩm từ request
            List<OrderDetailEntity> orderDetails = new ArrayList<>();
            int totalPrice = 0;
            for (OrderDetailRequest detailRequest : orderRequest.getOrderDetails()) {
                ProductEntity product = productRepository.findById(Math.toIntExact(detailRequest.getProductId()))
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                OrderDetailEntity orderDetail = new OrderDetailEntity();
                orderDetail.setProduct(product);
                orderDetail.setAmount(detailRequest.getAmount());
                orderDetail.setPrice(product.getPrice());
                orderDetail.setOrder(order);
                orderDetails.add(orderDetail);
                totalPrice += product.getPrice() * detailRequest.getAmount();
            }

            order.setOrderDetails(orderDetails);
            order.setTotalPrice(totalPrice);
            // 4. Lưu đơn hàng vào DB
            order = orderService.saveOrder(order);

            // 5. Xóa giỏ hàng
            List<Long> cartIds = new ArrayList<>();
            for (OrderDetailRequest detailRequest : orderRequest.getOrderDetails()) {
                CartEntity cart = cartDao.findByUserIdAndProductId(Math.toIntExact(orderRequest.getUserId()),
                                Math.toIntExact(detailRequest.getProductId())).stream()
                        .filter(cartEntity1 -> cartEntity1.getStatusCode() == 0).findFirst().orElseThrow(() -> new RuntimeException("Cart not found"));
                cartIds.add(cart.getId());
            }
            cartDao.deleteAllById(cartIds);

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
            @RequestBody Map<String, String> digitalSignature
    ) {
        String signature = digitalSignature.get("digitalSignature");
        orderService.saveDigitalSignature(orderId, signature);

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

    @GetMapping("/{orderId}")
    public ResponseEntity<Object> getOrder(@PathVariable Long orderId) {
        List<OrderDetailEntity> orders = orderService.getOrderById(orderId);
        return ResponseEntity.ok(orders.stream().map(orderMapper::entityToDto).toList());
    }
}


