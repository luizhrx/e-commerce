package br.com.springjpa.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório")
        String nome,

        String descricao,

        @NotNull(message = "O preço do produto é obrigatório")
        @Min(value = 0, message = "O preço deve ser maior ou igual a zero")
        BigDecimal preco,

        @NotNull(message = "O estoque do produto é obrigatório")
        @Size(min = 0, message = "A quantidade em estoque deve ser maior ou igual a zero")
        Integer quantidadeStock,

        @NotNull(message = "A categoria do produto é obrigatória")
        Long categoriaId
) {
}
