package br.com.springjpa.ecommerce.infra.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestClient;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"statusHttp\":401,\"mensagem\":\"Falha na autenticação: token inválido ou expirado\"}"
                            );
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"statusHttp\":403,\"mensagem\":\"Acesso negado: você não tem permissão para acessar este recurso\"}"
                            );
                        })
                )

                .authorizeHttpRequests(auth -> auth
                        // auth endpoints
                        .requestMatchers(HttpMethod.POST,"/auth/**").permitAll()

                        // Produtos - leitura pública, modificação só ADMIN
                        .requestMatchers(HttpMethod.GET, "/produtos/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/produtos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/produtos/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/produtos/**").hasAuthority("ROLE_ADMIN")

                        // Categorias - leitura pública, criação/edição/exclusão só ADMIN
                        .requestMatchers(HttpMethod.GET, "/categorias/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/categorias/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/categorias/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/categorias/**").hasAuthority("ROLE_ADMIN")

                        // Usuários - listar todos só ADMIN; rotas de usuário individual: autenticadas
                        .requestMatchers(HttpMethod.GET, "/usuarios").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/usuarios/**").authenticated()

                        // Endereços - lista global só ADMIN; endpoints de usuário (/usuarios/{id}/enderecos) serão acessíveis por usuário autenticado
                        .requestMatchers(HttpMethod.GET, "/enderecos").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/enderecos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/enderecos/**").authenticated()

                        // Pedidos - listagem e dashboard para ADMIN; status update pra ADMIN; pedidos de usuário acessíveis via /usuarios/{id}/pedidos
                        .requestMatchers(HttpMethod.GET, "/pedidos/dashboard").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/pedidos/*/status").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/pedidos").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/pedidos/**").authenticated()

                        // Libera as rotas do Swagger
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://e-commerce-corex3.vercel.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
