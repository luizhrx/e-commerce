package br.com.springjpa.ecommerce.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PedidoRequestDTO(
        @NotNull(message = "O endereço é obrigatório")
        Long enderecoId,
        @NotEmpty(message = "A lista de itens do pedido não pode ser vazia")
        List<ItemPedidoRequestDTO> itens

) {
}
