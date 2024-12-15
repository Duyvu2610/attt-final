package matcha.banking.be.util;

import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class KeyUtils {

    // Phát sinh cặp Key (RSA 2048)
    public static KeyPair generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        return keyPairGenerator.generateKeyPair();
    }

    // Encode Key sang dạng Base64
    public static String encodeKey(byte[] key) {
        return Base64.getEncoder().encodeToString(key);
    }

    // Hàm kiểm tra chữ ký
    public static boolean verifySignature(String data, String digitalSignature, String publicKey) throws Exception {
        Signature signature = Signature.getInstance("SHA256withRSA");
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        // Decode Public Key từ Base64
        byte[] publicKeyBytes = Base64.getDecoder().decode(publicKey);
        PublicKey pubKey = keyFactory.generatePublic(new X509EncodedKeySpec(publicKeyBytes));

        // Khởi tạo kiểm tra chữ ký
        signature.initVerify(pubKey);
        signature.update(data.getBytes()); // Dữ liệu ký

        // Xác minh chữ ký
        return signature.verify(Base64.getDecoder().decode(digitalSignature));
    }
}
