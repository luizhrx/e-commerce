package br.com.springjpa.ecommerce.dto.response;

import br.com.springjpa.ecommerce.enums.StatusPedido;

public record ContagemStatusDto(
        StatusPedido status,
        Long quantidade
) {
}
