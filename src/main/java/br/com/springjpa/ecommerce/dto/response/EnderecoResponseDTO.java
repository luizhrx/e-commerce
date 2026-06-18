package br.com.springjpa.ecommerce.dto.response;

public record EnderecoResponseDTO(
        Long id,
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep,
        String usuarioNome
) {
}
