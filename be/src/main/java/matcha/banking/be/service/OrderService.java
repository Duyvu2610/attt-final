package matcha.banking.be.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import matcha.banking.be.dao.*;
import matcha.banking.be.dto.CartRequestPayDto;
import matcha.banking.be.dto.SignatureData;
import matcha.banking.be.entity.*;
import matcha.banking.be.util.KeyUtils;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderDao orderRepository;
    private final ObjectMapper objectMapper;
    private final UserDao userDao;
    private final ProductDao productDao;
    private final PublicKeyDao publicKeyDao;

    // Lấy dữ liệu cần ký (thông tin người dùng và đơn hàng)
    public String generateSignatureData(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        try {
            // Gộp thông tin người dùng và đơn hàng thành JSON
            SignatureData data = new SignatureData();
            data.setOrderId(order.getId());
            data.setCreatedAt(order.getCreatedAt());
            data.setOrderDetails(order.getOrderDetails());

            UserEntity user = order.getUser();
            data.setUserId(user.getId());
            data.setUsername(user.getName());
            data.setEmail(user.getEmail());

            return objectMapper.writeValueAsString(data); // Trả về JSON
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature data", e);
        }
    }

    // Lưu chữ ký số
    @Transactional
    public void saveDigitalSignature(Long orderId, String digitalSignature) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setDigitalSignature(digitalSignature);
        order.setVerified(false); // Chưa xác thực ngay sau khi ký
        orderRepository.save(order);
    }

    // Xác minh chữ ký số
    public boolean verifyOrder(Long orderId) {
        // Lấy đơn hàng
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Lấy thông tin người dùng
        UserEntity user = order.getUser();
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Tạo dữ liệu ký
        String signatureData = generateSignatureData(orderId);

        try {
            // Lấy Public Key từ database
            Optional<PublicKeyEntity> optionalPublicKey = publicKeyDao.findByUserIdAndEndTimeIsNull(Long.valueOf(user.getId()));
            if (optionalPublicKey.isEmpty()) {
                throw new RuntimeException("No active public key found for user");
            }

            String publicKey = optionalPublicKey.get().getPublicKey();

            // Xác minh chữ ký số
            boolean isValid = KeyUtils.verifySignature(signatureData, order.getDigitalSignature(), publicKey);

            // Nếu chữ ký hợp lệ, cập nhật trạng thái đơn hàng
            if (isValid) {
                order.setVerified(true);
                order.setIsAccepted(true);
                List<CartEntity> cartEntities = new ArrayList<>();
                List<ProductEntity> productEntities = new ArrayList<>();
                for (OrderDetailEntity orderDetail : order.getOrderDetails()) {
                    ProductEntity productEntity = orderDetail.getProduct();
                    productEntity.setRemainingQuantity(productEntity.getRemainingQuantity() - orderDetail.getAmount());
                    productEntity.setQuantitySold(productEntity.getQuantitySold() + orderDetail.getAmount());
                    productEntity.setUpdatedAt(LocalDateTime.now());
                    productEntities.add(productEntity);
                }
                productDao.saveAll(productEntities);
                orderRepository.save(order);
            }

            return isValid;
        } catch (Exception e) {
            throw new RuntimeException("Error verifying digital signature", e);
        }
    }

    public OrderEntity saveOrder(OrderEntity order) {
        return orderRepository.save(order);
    }

    public List<OrderEntity> getUserOrders(Long userId) {
        return orderRepository.findByUser(userDao.findById(Math.toIntExact(userId)).orElseThrow(() -> new RuntimeException("User not found")));
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll().stream().sorted(Comparator.comparing(OrderEntity::getCreatedAt).reversed()).filter(e -> e.getIsAccepted() == null).toList();
    }

    public List<OrderDetailEntity> getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found")).getOrderDetails();
    }

    public void deleteOrder(Long orderId) {
        try {
            OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
            order.setIsAccepted(false);
            orderRepository.save(order);
        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("Order not found");
        }
    }
}
