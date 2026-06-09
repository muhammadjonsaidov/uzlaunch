package uz.uzlaunch.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import uz.uzlaunch.model.User;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final JwtEncoder encoder;

    @Value("${app.jwt.expiration:604800}")
    private final long expiration;

    public String issue(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("uzlaunch")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiration))
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("plan", user.getPlan().name())
                .build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public String issueAdmin() {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("uzlaunch")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiration))
                .subject("admin")
                .claim("roles", List.of("ADMIN"))
                .build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}