package matcha.banking.be.dto;

import jakarta.persistence.*;
import matcha.banking.be.entity.RoleEntity;

import java.time.LocalDateTime;
import java.util.List;

public class UserDto {
    private Integer id;
    private String name;

    private String email;

    private LocalDateTime created;

    private LocalDateTime updated;
    private List<String> roles;
}
