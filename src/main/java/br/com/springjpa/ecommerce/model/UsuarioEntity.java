package br.com.springjpa.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    @Size(min = 6,message = "A senha deve conter no mínimo 6 caracteres")
    private String senha;

    @OneToMany(mappedBy = "usuario",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<PedidoEntity> pedidos = new ArrayList<>();  // Um usuário pode ter vários pedidos

    @OneToMany(mappedBy ="usuario",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<EnderecoEntity> endereco = new ArrayList<>(); // Um usuário pode ter vários endereços
}
