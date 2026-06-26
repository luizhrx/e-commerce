package br.com.springjpa.ecommerce.dto.response;

import br.com.springjpa.ecommerce.enums.StatusPedido;

public record ContagemStatusDTO(
        StatusPedido status,
        Long quantidade
) {
}
