package br.com.springjpa.ecommerce.dto.response;

public record EnderecoEntregaResposeDTO(
            String rua,
            String numero,
            String complemento,
            String bairro,
            String cidade,
            String estado,
            String cep
) {
}
