package br.com.springjpa.ecommerce.dto.response;

import java.math.BigDecimal;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        Integer quantidadeStock,
        Long categoriaId,
        String categoriaNome
) {
}
