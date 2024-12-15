package matcha.banking.be.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import matcha.banking.be.dao.OrderDao;
import matcha.banking.be.dao.PublicKeyDao;
import matcha.banking.be.dao.UserDao;
import matcha.banking.be.dto.SignatureData;
import matcha.banking.be.entity.OrderEntity;
import matcha.banking.be.entity.PublicKeyEntity;
import matcha.banking.be.entity.UserEntity;
import matcha.banking.be.util.KeyUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderDao orderRepository;
    private final UserDao userRepository;
    private final ObjectMapper objectMapper;
    private final UserDao userDao;
    private PublicKeyDao publicKeyDao;

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
}
