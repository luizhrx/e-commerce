package br.com.springjpa.ecommerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "O email é obrigatorio")
        @Email(message = "Formato do email inválido")
        String email,

        @NotBlank(message = "A senha é obrigatoria")
        String senha
) {
}
