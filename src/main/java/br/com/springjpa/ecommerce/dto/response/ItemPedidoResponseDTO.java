package br.com.springjpa.ecommerce.dto.response;

import java.math.BigDecimal;

public record ItemPedidoResponseDTO(
        Long id,
        Integer quantidade,
        BigDecimal precoUnitario,
        String nomeProduto,
        String descricaoProduto,
        String categoriaProduto
) { }
