package br.com.springjpa.ecommerce.dto.request;

import br.com.springjpa.ecommerce.enums.StatusPedido;
import jakarta.validation.constraints.NotNull;


public record AtualizarStatusRequestDTO(
        @NotNull(message = "Status do pedido é obrigatório")
        StatusPedido status
) {
}