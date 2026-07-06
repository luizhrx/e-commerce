package br.com.springjpa.ecommerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,
        @NotBlank(message = "O email é obrigatório")
        @Email(message = "O email deve ser válido")
        String email,
        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6,message = "A senha deve conter no mínimo 6 caracteres")
        String senha
) { }
