package br.com.springjpa.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EnderecoRequestDTO(
        @NotBlank(message = "A rua é obrigatória")
        String rua,
        @NotBlank(message = "O número é obrigatório")
        String numero,
        String complemento,
        @NotBlank(message = "O bairro é obrigatório")
        String bairro,
        @NotBlank(message = "A cidade é obrigatória")
        String cidade,
        @NotBlank(message = "O estado é obrigatório")
        @Size(min = 2, max = 2, message = "O estado deve conter exatamente 2 caracteres, EX: SP, RJ, MG")
        String estado,
        @NotBlank(message = "O CEP é obrigatório")
        @Size(min = 8, max = 8, message = "O CEP deve conter exatamente 8 caracteres")
        String cep
) { }
