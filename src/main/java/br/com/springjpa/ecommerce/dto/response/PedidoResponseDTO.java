package br.com.springjpa.ecommerce.dto.response;

import br.com.springjpa.ecommerce.dto.request.ItemPedidoRequestDTO;
import br.com.springjpa.ecommerce.enums.StatusPedido;
import br.com.springjpa.ecommerce.model.Endereco;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseDTO(
        Long id,
        LocalDateTime dataCriacao,
        StatusPedido status,
        BigDecimal valorTotal,
        EnderecoEntregaResposeDTO enderecoEntrega,
        List<ItemPedidoResponseDTO> itens
) {
}
