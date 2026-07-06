package br.com.springjpa.ecommerce.dto.response;

public record LoginResponseDTO(
        String mensagem,
        String token
) {
}
