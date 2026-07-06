package br.com.springjpa.ecommerce.infra.config;

import br.com.springjpa.ecommerce.model.UsuarioEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    // Gera o Token
    public String gerarToken(UsuarioEntity user){

        System.out.println("Gerando token para: " + user.getUsername());
        System.out.println("Email do usuario: " + user.getEmail());

        return Jwts.builder()
                .subject(user.getUsername())   // email do usuário
                .issuedAt(new Date())          // quando foi gerado
                .expiration(new Date(System.currentTimeMillis() + expiration))  // quando expira
                .signWith(getSecretKey())      // assina com a chave secreta
                .compact();                    // gera a string final
    }

    private Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    public boolean tokenValido(String token, UserDetails userDetails) {
        String email = extrairEmail(token);
        return email.equals(userDetails.getUsername()) && !tokenExpirado(token);
    }

    private boolean tokenExpirado(String token) {
        return extrairClaims(token).getExpiration().before(new Date());
    }
}
