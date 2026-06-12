package br.com.springjpa.ecommerce.dto.response;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email) {
}
