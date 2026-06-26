package br.com.springjpa.ecommerce.dto.request;

import br.com.springjpa.ecommerce.enums.StatusPedido;

public record AtualizarStatusRequestDTO(
        StatusPedido status
) {
}
