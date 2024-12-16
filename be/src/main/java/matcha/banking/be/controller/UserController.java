package matcha.banking.be.controller;

import lombok.RequiredArgsConstructor;
import matcha.banking.be.mapper.UserMapper;
import matcha.banking.be.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateUser(@RequestBody Map<String, Object> payload, @PathVariable Integer id) {
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        String avatar = (String) payload.get("avatar");
        userService.updateUser(email, name, avatar, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getUser(@PathVariable Integer id) {
        return ResponseEntity.ok(userMapper.entityToDto(userService.getUserById(id)));
    }
}
