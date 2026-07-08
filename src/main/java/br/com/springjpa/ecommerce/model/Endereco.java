package br.com.springjpa.ecommerce.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable //Uma anotacão que indica que essa classe é um componente embutido, ou seja, seus campos serão incorporados na tabela da entidade que a utiliza.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    @Column(nullable = false)
    @NotBlank(message = "Rua é obrigatória")
    private String rua;

    @Column(nullable = false)
    @NotBlank(message = "Número é obrigatório")
    private String numero;

    private String complemento;

    @Column(nullable = false)
    @NotBlank(message = "Bairro é obrigatório")
    private String bairro;

    @Column(nullable = false)
    @NotBlank(message = "Cidade é obrigatória")
    private String cidade;

    @Column(nullable = false, length = 2)
    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
    private String estado;

    @Column(nullable = false, length = 8)
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP deve estar no formato XXXXX-XXX ou XXXXXXXX")
    private String cep;
}