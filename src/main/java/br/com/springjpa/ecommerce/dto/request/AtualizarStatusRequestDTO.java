package br.com.springjpa.ecommerce.dto.request;

import br.com.springjpa.ecommerce.enums.StatusPedido;
import jakarta.validation.constraints.NotBlank;

public record AtualizarStatusRequestDTO(
        @NotBlank(message = "Status do pedido é obrigatório")
        StatusPedido status
) {
}
