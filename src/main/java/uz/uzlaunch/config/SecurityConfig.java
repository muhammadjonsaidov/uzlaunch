package uz.uzlaunch.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import uz.uzlaunch.security.OAuth2SuccessHandler;
import uz.uzlaunch.service.RateLimiter;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtDecoder jwtDecoder;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Value("${app.frontend-url:http://localhost:3000}")
    private final String frontendUrl;

    @Bean
    @Order(1)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                .requestMatchers("/api/admin/auth").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder).jwtAuthenticationConverter(jwtAuthConverter()))
            );
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain webFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .headers(h -> h.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .sessionManagement(s -> s.sessionFixation().migrateSession())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)
            .oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler));
        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration restricted = new CorsConfiguration();
        restricted.setAllowedOrigins(List.of(frontendUrl, "http://localhost:3000",
                "https://uzlaunch.uz", "https://www.uzlaunch.uz"));
        restricted.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        restricted.setAllowedHeaders(List.of("*"));
        restricted.setAllowCredentials(true);

        CorsConfiguration embed = new CorsConfiguration();
        embed.setAllowedOriginPatterns(List.of("*"));
        embed.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        embed.setAllowedHeaders(List.of("*"));
        embed.setAllowCredentials(false);

        return request -> {
            String path = request.getRequestURI();
            if (path != null && path.startsWith("/api/public/projects/")
                    && (path.endsWith("/subscribe") || path.endsWith("/stream") || path.endsWith("/track") || path.matches("/api/public/projects/[^/]+"))) {
                return embed;
            }
            if (path != null && path.equals("/widget.js")) return embed;
            return restricted;
        };
    }

    private JwtAuthenticationConverter jwtAuthConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthConverter.setAuthoritiesClaimName("roles");
        grantedAuthConverter.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(grantedAuthConverter);
        return converter;
    }

    @Bean("subscribeRateLimiter")
    public RateLimiter subscribeRateLimiter() {
        return new RateLimiter(3, 3_600_000L);
    }

    @Bean("adminRateLimiter")
    public RateLimiter adminRateLimiter() {
        return new RateLimiter(5, 900_000L);
    }

    @Bean("registerRateLimiter")
    public RateLimiter registerRateLimiter() {
        return new RateLimiter(5, 3_600_000L);
    }

    @Bean("streamRateLimiter")
    public RateLimiter streamRateLimiter() {
        return new RateLimiter(10, 60_000L);
    }
}