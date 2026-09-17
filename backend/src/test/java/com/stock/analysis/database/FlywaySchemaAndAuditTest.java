package com.stock.analysis.database;

import com.stock.analysis.users.User;
import com.stock.analysis.users.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
// import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class FlywaySchemaAndAuditTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should successfully insert user and populate audit fields via JPA/DB entity lifecycle")
    void testEntityAuditFieldsPopulation() {
        User user = User.builder()
                .username("audit_test_user")
                .email("audit@quant.com")
                .password("HashedSecretPass123!")
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();

        Optional<User> fetched = userRepository.findById(savedUser.getId());
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getUsername()).isEqualTo("audit_test_user");
        assertThat(fetched.get().getCreatedAt()).isNotNull();
    }
}
