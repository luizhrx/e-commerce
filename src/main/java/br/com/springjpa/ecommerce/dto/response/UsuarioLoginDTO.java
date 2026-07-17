package br.com.springjpa.ecommerce.dto.response;

public record UsuarioLoginDTO(
        Long id,
        String nome,
        String email,
        String role
) {
}
